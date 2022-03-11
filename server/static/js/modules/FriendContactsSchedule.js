class FriendContactsSchedule {
    constructor() {
        this.execute = [];
        this.countTarget = document.getElementById("friendsContacts_friends_count")
        this.parent = document.getElementById('friendsContacts_friends');
    }

    async Interrupt(friend) {
        this.execute.splice(0, 0, friend);
        this.Execute()
    }

    async displayCount() {
        this.countTarget.innerHTML = this.execute.length
    }

    async addFriend(friend) {
        let status = true
        for (let i of this.execute) {
            if (i.id === friend.id) {
                status = false
                break;
            }
        }
        if (status) { this.execute.push(friend); }
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
        if (profile === null) { profile = '' }
        let element = document.createElement('div');
        element.setAttribute('id', `FriendContact_${friend.id}`);
        element.setAttribute('class', 'friend animate__animated animate__fadeIn');
        element.innerHTML = `
    <div class="friend">
            <div class="profile">
                <div class="img">
                    <img class="img" src="${profile}" alt="">
                </div>
                <div class="fullname">${friend.fullName}</div>
            </div>
        </div>
    `;
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
        } else { this.displayNone() }
        this.displayCount()
    }

    schedule() {
        this.removeChild()
        this.Execute()
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

export default FriendContactsSchedule