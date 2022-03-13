let parser = document.createElement('a');
parser.href = document.URL
var id = parser.pathname.split("/").slice(-2)[0]
console.log("uid", id)

var follower = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/follower', { query: `page=follower&uid=${id}` });

document.getElementById('btn_profile').addEventListener("click", function() {
    document.location = `/profile/${id}`
});
document.getElementById('btn_follower').addEventListener("click", function() {
    document.location = `/profile/${id}/follower`
});
document.getElementById('btn_following').addEventListener("click", function() {
    document.location = `/profile/${id}/following`
});


class FollowerOrganize {
    constructor() {
        this.followers = []
        this.container = document.getElementById('followers')
    }

    find_follower_index(id) {
        return this.followers.findIndex(follower => follower.id == id)
    }

    add(data) {
        console.log("🚀 ~ file: follower.js ~ line 29 ~ follower ~ add ~ data", data)
        if (data.lenght > 0) {
            for (let i = 0; i <= data.lenght - 1; i++) {
                if (this.find_follower_index(data[i].id) > 0) {
                    this.followers.push(data[i])
                }
            }
        }
        console.log("🚀 ~ file: follower.js ~ line 33 ~ follower ~ add ~ this.followers", this.followers)
    }

    createElement(data) {
        let elm = document.createElement('div')
        elm.setAttribute('id', `followers_${data.id}`)
        let html = `
        <div class="profile">
            <div class="img">
                <img src="/api/profile?file=${data.profile}" alt="">
            </div>
            <div class="detail">
                <div class="name" id="followers_1_name">${data.profile}</div>
                <div class="email" id="followers_1_email">${data.profile}</div>
                <div class="action">
                    <button onclick="follower(${data.id});">
                        Follower
                    </button>
                </div>
            </div>
        </div>
        `
        elm += html
        return elm
    }

    execute() {
        this.removeChild()
        for (let i = 0; i <= this.followers.length - 1; i++) {
            if (document.getElementById(`followers_${this.followers[i].id}`) !== undefined) {
                let follower = this.createElement(this.followers[i])
                this.container.appendChild(follower)
            }
        }
    }

    removeChild() {
        if (this.followers.length < 1) {
            if (this.container.children.length > 0) {
                let len = this.container.children.length
                for (let i = 0; i < len; i++) {
                    this.container.removeChild(this.container.children[0]);
                }
            }
        }

    }
}

var followerOrganize = new FollowerOrganize()

var alertMini = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    width: '22rem',
    padding: '0.5rem',
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

var mySwal = Swal.mixin({
    customClass: {
        container: 'mySwal',
        popup: 'mySwal_popup',
        header: '',
        title: 'mySwal_title',
        closeButton: '',
        icon: '',
        image: '',
        content: 'mySwal_content',
        htmlContainer: '',
        input: '',
        inputLabel: '',
        validationMessage: '',
        actions: '',
        confirmButton: 'mySwal_confirm',
        denyButton: '',
        cancelButton: 'mySwal_cancel ms-2',
        loader: '',
        footer: '',
        timerProgressBar: '',
    },
    buttonsStyling: false
})

class Profile {
    constructor() {
        this.fullName = ''
        this.email = ''
        this.profile = ''
    }
}

var profile = new Profile();

follower.on("connect", async(msg) => {
    console.log("sid", follower.id)
});

follower.on("disconnect", async(reason) => {
    if (reason === "io server disconnect") {
        follower.connect();
    }
});

follower.on("connect_error", async() => {
    setTimeout(() => {
        follower.connect();
    }, 1000);
});

follower.on('message', async(msg) => {
    alertMini.fire({
        text: `Received message : ${msg}`
    })
});

follower.on('profile', async(msg) => {
    console.log("🚀 ~ file: profile.js ~ line 32 ~ follower.on ~ msg", msg)
    profile.fullName = msg.fullName
    profile.email = msg.email
    profile.profile = msg.profile
    document.getElementById("name").innerHTML = profile.fullName
    document.getElementById("email").innerHTML = profile.email
    document.getElementById("image").setAttribute('src', '/api/profile?file=' + profile.profile)
});
follower.on('profile_notFound', async(msg) => {
    console.log("profile_notFound")
});


follower.on('ban', async(msg) => {
    console.log("ban")
});
follower.on('follower', async(msg) => {
    console.log("follower", msg)
    await followerOrganize.add(msg)
    await followerOrganize.execute()
});