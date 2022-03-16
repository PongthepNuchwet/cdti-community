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

async function unFollower(id) {
    console.log("🚀 ~ file: follower.js ~ line 19 ~ unFollower ~ id", id)
    await follower.emit("unFollower", {
        id: id,
    });
}
async function accept(id) {
    console.log("🚀 ~ file: follower.js ~ line 25 ~ accept ~ id", id)
    await follower.emit("accept", {
        follow_id: id,
    });
}

class FollowerOrganize {
    constructor() {
        this.followers = []
        this.container = document.getElementById('followers')
        this.uid
        this.meName
    }

    find_follower_index(id) {
        return this.followers.findIndex(follower => follower.id == id)
    }

    add(data) {

        if (data.length > 0) {
            for (let i = 0; i <= data.length - 1; i++) {
                console.log("🚀 ~ file: follower.js ~ line 34 ~ FollowerOrganize ~ add ~  this.find_follower_index(data[i].id)", this.find_follower_index(data[i].id))
                if (this.find_follower_index(data[i].id) < 0 || this.followers.length < 1) {
                    this.followers.push(data[i])
                }
            }
        }
    }

    createElement(data) {
        let elm = document.createElement('div')
        elm.setAttribute('id', `followers_${data.id}`)
        elm.setAttribute('class', `follower`)
        let html = `
        <div class="profile">
            <div class="img">
                <img src="/api/profile?file=${data.profile}" alt="">
            </div>
            <div class="detail">
                <div class="name" id="followers_1_name">${data.fullName}</div>
                <div class="email" id="followers_1_email">${data.email}</div>
        `
        if (id == this.uid) {
            html += `
            <div class="action">
                    <button id="followers_${data.id}_btn" onclick="unFollower(${data.id});">
                        Follower
                    </button>
                </div>`
        }
        html += `</div>
        </div>`
        elm.innerHTML = html
        return elm
    }

    execute() {
        this.removeChild()
        console.log(this.followers.length)
        for (let i = 0; i < this.followers.length; i++) {
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
    profile.fullName = msg.user.fullName
    profile.email = msg.user.email
    profile.profile = msg.user.profile
    followerOrganize.uid = msg.uid
    document.getElementById("name").innerHTML = profile.fullName
    document.getElementById("email").innerHTML = profile.email
    document.getElementById("image").setAttribute('src', '/api/profile?file=' + profile.profile)
});
follower.on('profile_notFound', async(msg) => {
    console.log("profile_notFound")
});

follower.on("unFollower_error", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to unFollower.'
    });
});

follower.on("unFollower_success", async(reason) => {
    console.log("unFollower_success")
    let target = document.getElementById(`followers_${reason.follower_id}_btn`)
    target.setAttribute('onclick', `accept(${reason.follower_id})`)
    target.classList.add('accept')
    target.innerHTML = 'Accept'
});

follower.on("accept_error", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to unFollower.'
    });
});

follower.on("accept_success", async(reason) => {
    console.log("accept_success")
    let target = document.getElementById(`followers_${reason.follower_id}_btn`)
    target.setAttribute('onclick', `unFollower(${reason.follower_id})`)
    target.classList.remove('Follower')
    target.innerHTML = 'Follower'
});

follower.on('ban', async(msg) => {
    console.log("ban")
});
follower.on('follower', async(msg) => {
    console.log("follower", msg)
    await followerOrganize.add(msg)
    await followerOrganize.execute()
});