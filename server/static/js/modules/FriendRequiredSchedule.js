class FriendRequiredSchedule {
    constructor() {
        this.queue = [];
        this.execute = [];
        this.count = 2
        this.countTarget = document.getElementById("friendsRequired_friends_count")
        this.parent = document.getElementById('friendsRequired_friends');
    }

    async Interrupt(friend) {
        console.log("🚀 ~ file: feeds.js ~ line 151 ~ FriendRequiredSchedule ~ Interrupt ~ friend", friend)
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
        console.log("🚀 ~ file: feeds.js ~ line 181 ~ FriendRequiredSchedule ~ createElement ~ friend", friend)
        let profile = friend.profile;
        console.log("🚀 ~ file: feeds.js ~ line 183 ~ FriendRequiredSchedule ~ createElement ~ friend.profile", friend.profile)
        console.log("🚀 ~ file: feeds.js ~ line 183 ~ FriendRequiredSchedule ~ createElement ~ profile", profile)
        if (profile === "NULL") {
            profile = '';
            console.log("🚀 ~ file: feeds.js ~ line 186 ~ FriendRequiredSchedule ~ createElement ~ profile", profile)
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
        <button id="newFriend" onClick="acceptInFeed('${friend.id}');" class="action-add">Accept</button>
        <button id="newFriend" onClick="removeAcceptInFeed('${friend.id}');" class="action-remove">Remove</button>
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

    schedule() {
        if (this.execute.length < this.count) {
            if (this.queue.length > 0 || this.execute.length > 0) {
                for (let i = 0; i < this.count; i++) {
                    if (this.queue[0] !== undefined) {
                        this.execute.push(this.queue.shift())
                    }
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

export default FriendRequiredSchedule;