let parser = document.createElement('a');
parser.href = document.URL
var id = parser.pathname.split("/").slice(-2)[0]
console.log("uid", id)

var following = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/following', { query: `page=following&uid=${id}` });

document.getElementById('btn_profile').addEventListener("click", function() {
    document.location = `/profile/${id}`
    console.log("🚀 ~ file: following.js ~ line 10 ~ document.getElementById ~ `/profile/${id}`", `/profile/${id}`)
});
document.getElementById('btn_follower').addEventListener("click", function() {
    document.location = `/profile/${id}/follower`
});
document.getElementById('btn_following').addEventListener("click", function() {
    document.location = `/profile/${id}/following`
});

async function unfollowing(id) {
    console.log("🚀 ~ file: following.js ~ line 19 ~ unfollowing ~ id", id)
    await following.emit("unFollowing", {
        following_id: id,
    });
}
async function follow(id) {
    console.log("🚀 ~ file: following.js ~ line 25 ~ follow ~ id", id)
    await following.emit("follow", {
        follow_id: id,
    });
}

class FollowingOrganize {
    constructor() {
        this.followings = []
        this.container = document.getElementById('followings')
        this.uid
        this.meName
    }

    find_following_index(id) {
        return this.followings.findIndex(following => following.id == id)
    }

    add(data) {

        if (data.length > 0) {
            for (let i = 0; i <= data.length - 1; i++) {
                console.log("🚀 ~ file: following.js ~ line 34 ~ followingOrganize ~ add ~  this.find_following_index(data[i].id)", this.find_following_index(data[i].id))
                if (this.find_following_index(data[i].id) < 0 || this.followings.length < 1) {
                    this.followings.push(data[i])
                }
            }
        }
    }

    createElement(data) {
        let elm = document.createElement('div')
        elm.setAttribute('id', `followings_${data.id}`)
        elm.setAttribute('class', `following`)
        let html = `
        <div class="profile">
            <div class="img">
                <img src="/api/profile?file=${data.profile}" alt="">
            </div>
            <div class="detail">
                <div class="name" id="followings_1_name">${data.fullName}</div>
                <div class="email" id="followings_1_email">${data.email}</div>
        `
        if (id == this.uid) {
            html += `
            <div class="action">
                    <button id="followings_${data.id}_btn" onclick="unfollowing(${data.id});">
                        following
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
        console.log(this.followings.length)
        for (let i = 0; i < this.followings.length; i++) {
            if (document.getElementById(`followings_${this.followings[i].id}`) !== undefined) {
                let following = this.createElement(this.followings[i])
                this.container.appendChild(following)
            }
        }
    }

    removeChild() {
        if (this.followings.length < 1) {
            if (this.container.children.length > 0) {
                let len = this.container.children.length
                for (let i = 0; i < len; i++) {
                    this.container.removeChild(this.container.children[0]);
                }
            }
        }

    }
}

var followingOrganize = new FollowingOrganize()

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

following.on("connect", async(msg) => {
    console.log("sid", following.id)
});

following.on("disconnect", async(reason) => {
    if (reason === "io server disconnect") {
        following.connect();
    }
});

following.on("connect_error", async() => {
    setTimeout(() => {
        following.connect();
    }, 1000);
});

following.on('message', async(msg) => {
    alertMini.fire({
        text: `Received message : ${msg}`
    })
});

following.on('profile', async(msg) => {
    profile.fullName = msg.user.fullName
    profile.email = msg.user.email
    profile.profile = msg.user.profile
    followingOrganize.uid = msg.uid
    document.getElementById("name").innerHTML = profile.fullName
    document.getElementById("email").innerHTML = profile.email
    document.getElementById("image").setAttribute('src', '/api/profile?file=' + profile.profile)
});
following.on('profile_notFound', async(msg) => {
    console.log("profile_notFound")
});

following.on("unFollowing_error", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to unfollowing.'
    });
});

following.on("unFollowing_success", async(reason) => {
    console.log("unfollowing_success")
    let target = document.getElementById(`followings_${reason.following_id}_btn`)
    target.setAttribute('onclick', `follow(${reason.following_id})`)
    target.classList.add('follow')
    target.innerHTML = 'Follow'
});

following.on("follow_error", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to follow.'
    });
});

following.on("follow_success", async(reason) => {
    console.log("follow_success")
    let target = document.getElementById(`followings_${reason.following_id}_btn`)
    target.setAttribute('onclick', `unfollowing(${reason.following_id})`)
    target.classList.remove('following')
    target.innerHTML = 'following'
});

following.on('ban', async(msg) => {
    console.log("ban")
});
following.on('following', async(msg) => {
    console.log("following", msg)
    await followingOrganize.add(msg)
    await followingOrganize.execute()
});