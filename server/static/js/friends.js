var friendsIO = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/friends', { query: 'page=friends' });

friendsIO.on("connect", async(msg) => {
    console.log(friendsIO.id)
});

friendsIO.on("disconnect", async(reason) => {
    if (reason === "io server disconnect") {
        friendsIO.connect();
    }
});

friendsIO.on("connect_error", async() => {
    setTimeout(() => {
        friendsIO.connect();
    }, 1000);
});

friendsIO.on('message', async(msg) => {
    alertMini.fire({
        text: `Received message : ${msg}`
    })
});



friendsIO.on('friends-search-success', async(msg) => {
    console.log("🚀 ~ file: friends.js ~ line 26 ~ friendsIO.on ~ msg", msg)
    friend_search.search_success(msg)
});
friendsIO.on('friends-search-notFound', async(msg) => {
    console.log("friends-search-notFound")
    friend_search.search_notfound()
});

friendsIO.on("newFollowError", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to Follow.'
    });
});

friendsIO.on("newFollowSuccess", async(respone) => {
    console.log("🚀 ~ file: friends.js ~ line 42 ~ friendsIO.on ~ respone", respone)
    if (respone['tab'] == 'search') {
        friend_search.FollowSuccess(respone['follow_id'])
    } else if (respone['tab'] == 'suggestion') {
        FriendRecomOrganize.displayCount()
    }
    alertMini.fire({
        icon: 'success',
        title: 'Successfully Follow.'
    });
});

friendsIO.on('friend_recommend', async(msg) => {
    console.log("🚀 ~ file: friends.js ~ line 50 ~ friendsIO.on ~ msg", msg)
    await FriendRecomOrganize.addFriends(msg);
    await FriendRecomOrganize.Organize();
});

// friendsIO.on('friend_recommend_interrupt', async(msg) => {
//     console.log("🚀 ~ file: friends.js ~ line 56 ~ friendsIO.on ~ msg", msg)
//         // await FriendRecomOrganize.Interrupt(msg);
// });
friendsIO.on('friend_Required', async(msg) => {
    await FriendReqOrganize.addFriends(msg);
    await FriendReqOrganize.Organize();
});

// friendsIO.on('friend_Required_interrupt', async(msg) => {
//     await FriendReqOrganize.Interrupt(msg);
// });


friendsIO.on("accept_error", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to Accept.'
    });
});

friendsIO.on("accept_success", async(reason) => {
    console.log("🚀 ~ file: friends.js ~ line 84 ~ friendsIO.on ~ reason", reason)
    alertMini.fire({
        icon: 'success',
        title: 'Successfully Accept.'
    });
});



async function follow(id) {
    await friendsIO.emit("follow", {
        follow_id: id,
        tab: 'search'
    });
}

async function followInSuggestion(id) {
    await friendsIO.emit("follow", {
        follow_id: id,
        tab: 'suggestion'
    });
    FriendRecomOrganize.removeQueueById(id)
    FriendRecomOrganize.Organize();
}
async function removeFollowInSuggestion(id) {
    FriendRecomOrganize.removeQueueById(id)
    FriendRecomOrganize.Organize();
}

async function acceptInRequired(id) {
    await friendsIO.emit("accept", {
        follow_id: id,
    });
    FriendReqOrganize.removeQueueById(id)
    FriendReqOrganize.Organize();
}
async function removeAcceptInRequired(id) {
    FriendReqOrganize.removeQueueById(id)
    FriendReqOrganize.Organize();
}


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

class FriendRequiredOrganize {
    constructor() {
        this.queue = [];
        this.execute = [];
        this.countTarget = document.getElementById("friend-control-Required-count")
        this.parent = document.getElementById('friends-requests');
    }

    async Interrupt(friend) {
        this.queue.splice(0, 0, this.execute.pop());
        this.execute.splice(0, 0, friend);
        this.Execute()
    }

    async displayCount() {
        this.countTarget.innerHTML = this.queue.length + this.execute.length
    }

    async addFriend(friend) {
        let status = true
        for (let i of this.queue.concat(this.execute)) {
            if (i.id === friend.id) {
                status = false
                break;
            }
        }
        if (status) { this.queue.push(friend); }
    }

    async addFriends(arrar) {
        if (arrar.length > 0) {
            arrar.forEach((value) => {
                this.addFriend(value);
            })
        }
    }

    async createElement(friend) {
        let profile = friend.profile;
        if (profile === "NULL") {
            profile = '';
        }
        let element = document.createElement('div');
        element.setAttribute('id', `FriendRequired_${friend.id}`);
        element.setAttribute('class', 'friend animate__animated animate__fadeIn');
        element.innerHTML = `
        <div class="profile">
        <div class="img">
            <img class="img" src="${profile}" alt="">
        </div>
        <div class="fullname">${friend.fullName}
            <span>wants to add you to friends</span>
        </div>
    </div>
    <div class="action">
        <button id="newFriend" onClick="acceptInRequired('${friend.id}');" class="action-add">Accept</button>
        <button id="newFriend" onClick="removeAcceptInRequired('${friend.id}');" class="action-remove">Remove</button>
    </div>`;
        this.parent.appendChild(element);
    }

    async displayNone() {
        this.parent.innerHTML = '<div class="none">none</div>'
    }

    Execute() {
        this.removeChild()
        if (this.execute.length > 0) {
            for (let i = 0; i < this.execute.length; i++) {
                if (this.execute[i] !== undefined) {
                    this.createElement(this.execute[i]);
                }
            }
        } else {
            this.displayNone()
        }
        this.displayCount()
    }

    Organize() {
        let len = this.queue.length
        if (this.queue.length > 0 || this.execute.length > 0) {
            for (let i = 0; i <= len; i++) {
                if (this.queue[0] !== undefined) {
                    this.execute.push(this.queue.shift())
                }
            }

        }

        this.Execute()
    }
    removeQueue() {
        this.execute.shift();
    }
    removeQueueById(id) {
        let temp = this.execute.filter((value) => { return value.id != id })
        this.execute = temp
    }

    removeChild() {
        if (this.parent) {
            if (this.parent.children.length > 0) {
                let len = this.parent.children.length
                for (let i = 0; i < len; i++) {
                    this.parent.removeChild(this.parent.children[0]);
                }
            }
        }

    }
}

class FriendRecommendOrganize {
    constructor() {
        this.queue = [];
        this.execute = [];
        this.count = 1
        this.countTarget = document.getElementById("friend-control-suggestions-count")
        this.parent = document.getElementById('friends-suggestions');

    }
    async Interrupt(friend) {
        if (this.execute.length > 0) { this.queue.splice(0, 0, this.execute.pop()); }
        this.execute.splice(0, 0, friend);
        this.Execute()
    }

    async displayCount() {
        this.countTarget.innerHTML = this.queue.length + this.execute.length
    }

    async addFriend(friend) {
        let status = true
        for (let i of this.queue.concat(this.execute)) {
            if (i.id === friend.id) {
                status = false
                break;
            }
        }
        if (status) { this.queue.push(friend); }
    }

    addFriends(arrar) {
        if (arrar.length > 0) {
            arrar.forEach((value) => {
                this.addFriend(value);
            })
        }
        this.displayCount()
    }

    createElement(friend) {
        let profile = friend.profile;
        if (profile === null) { profile = '' }
        let element = document.createElement('div');
        element.setAttribute('id', `FriendRecommend_${friend.id}`);
        element.setAttribute('class', 'friend animate__animated animate__fadeIn');
        element.innerHTML = `
        <div class="profile">
        <div class="img">
            <img class="img" src="${profile}" alt="">
        </div>
        <div class="fullname">${friend.fullName}
            <span>Recommend friends for you</span>
        </div>
    </div>
    <div class="action">
        <button id="newFriend" onClick="followInSuggestion('${friend.id}');" class="action-add">Follow</button>
        <button id="newFriend" onClick="removeFollowInSuggestion('${friend.id}');" class="action-remove">Remove</button>
    </div>`;
        this.parent.appendChild(element);
    }

    displayNone() {
        this.parent.innerHTML = '<div class="none">none</div>'
    }

    Execute() {
        this.removeChild()
        if (this.execute.length > 0) {
            for (let i = 0; i < this.execute.length; i++) {
                if (this.execute[i] !== undefined) {
                    this.createElement(this.execute[i]);
                }
            }
        } else {
            this.displayNone()
        }
    }

    Organize() {
        console.log("🚀 ~ file: friends.js ~ line 205 ~ FriendRecommendOrganize ~ Organize ~ this.queue.length", this.queue.length)
        let len = this.queue.length
        if (this.queue.length > 0 || this.execute.length > 0) {
            for (let i = 0; i <= len; i++) {
                console.log("🚀 ~ file: friends.js ~ line 207 ~ FriendRecommendOrganize ~ Organize ~ i", i)
                if (this.queue[0] !== undefined) {
                    this.execute.push(this.queue.shift())
                }
            }
        }
        this.Execute()
    }
    removeQueue() {
        this.execute.shift();
    }
    removeQueueById(id) {
        let temp = this.execute.filter((value) => { return value.id != id })
        this.execute = temp
    }

    removeChild() {
        if (this.parent.children.length > 0) {
            let len = this.parent.children.length
            for (let i = 0; i < len; i++) {
                this.parent.removeChild(this.parent.children[0]);
            }
        }
    }
}

class FriendControl {
    constructor() {
        this.requests = document.getElementById("friend-requests")
        this.search = document.getElementById("friend-search")
        this.suggestions = document.getElementById("friend-suggestions")
        this.btn_requests = document.getElementById("friend-control-required")
        this.btn_search = document.getElementById("friend-control-search")
        this.btn_suggestions = document.getElementById("friend-control-suggestions")

        this.btn_requests.addEventListener('click', (e) => {
            this.requests.classList.remove('d-none')
            this.requests.classList.add('d-block')
            this.search.classList.add('d-none')
            this.suggestions.classList.add('d-none')
        })

        this.btn_search.addEventListener('click', (e) => {
            this.requests.classList.add('d-none')
            this.search.classList.remove('d-none')
            this.search.classList.add('d-block')
            this.suggestions.classList.add('d-none')
        })
        this.btn_suggestions.addEventListener('click', (e) => {
            this.requests.classList.add('d-none')
            this.search.classList.add('d-none')
            this.suggestions.classList.remove('d-none')
            this.suggestions.classList.add('d-block')
        })
    }



}

class FriendSearch {
    constructor() {
        this.input
        this.btn
        this.friends_search_dom
    }

    FollowSuccess(id) {
        console.log("🚀 ~ file: friends.js ~ line 105 ~ FriendSearch ~ FollowSuccess ~ id", id)
        let traget = document.getElementById(`friend-search-friend-${id}`)
            // friend-search-friend-4
        this.friends_search_dom.removeChild(traget)
    }

    notFound() {

    }

    create_elm(data) {
        console.log("🚀 ~ file: friends.js ~ line 48 ~ FriendSearch ~ create_elm ~ data", data)
        let elm = document.createElement('div')
        elm.setAttribute('id', `friend-search-friend-${data.id}`)
        elm.setAttribute('class', `friend animate__animated animate__fadeIn`)
        let html = `
        <div class="profile">
            <div class="img">
                <img class="img" src="${data.profile}" alt="">
            </div>
            <div class="fullname">
                <a href="/profile/${data.id}" target=”_blank”>${data.fullName}</a>
            </div>
            <div class="action">
                <button id="newFriend" onclick="follow('${data.id}');" class="action-add">Follow</button>
            </div>
        </div>`
        elm.innerHTML = html
        return elm
    }

    showNone() {
        let elm = document.createElement('div')
        elm.setAttribute('class', 'none')
        elm.innerHTML = 'none'
        this.friends_search_dom.appendChild(elm)
    }

    search_notfound() {
        this.removeChild()
        this.showNone()
    }

    search_success(msg) {
        console.log("🚀 ~ file: friends.js ~ line 80 ~ FriendSearch ~ search_success ~ msg", msg)
        if (msg.length > 0) {
            this.removeChild()
            for (let i = 0; i <= msg.length - 1; i++) {
                let friend = this.create_elm(msg[i])
                this.friends_search_dom.appendChild(friend)
            }
        } else {
            this.notFound()
        }
    }

    onEmit() {
        friendsIO.emit("Keydown", {
            query: this.input.value
        });
    }

    onKeydown() {
        console.log("Keydown", this.input.value)
        if (this.input.value != '') { this.onEmit() }

    }
    onClick() {
        console.log(`onClick`)
    }

    setInput(dom) {
        this.input = dom
        console.log("🚀 ~ file: friends.js ~ line 17 ~ FriendSearch ~ setInput ~ this.input", this.input)
        this.input.addEventListener('input', (e) => {
            this.onKeydown()
        })
    }
    setBtn(dom) {
        this.btn = dom
        this.btn.addEventListener('click', (e) => {
            this.onClick()
        })
    }

    removeChild() {
        if (this.friends_search_dom.children.length > 0) {
            let len = this.friends_search_dom.children.length
            for (let i = 0; i < len; i++) {
                this.friends_search_dom.removeChild(this.friends_search_dom.children[0]);
            }
        }


    }

}

var friend_search = new FriendSearch()
var FriendRecomOrganize = new FriendRecommendOrganize()
var friendControl = new FriendControl()
var FriendReqOrganize = new FriendRequiredOrganize();

console.log("🚀 ~ file: friends.js ~ line 366 ~ friendControl", friendControl)
friend_search.setInput(document.getElementById("friend-search-input"))
friend_search.setBtn(document.getElementById("friend-search-btn"))
friend_search.friends_search_dom = document.getElementById("friend-search-friends")