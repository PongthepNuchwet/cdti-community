Dropzone.autoDiscover = false;

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/feeds');
var imagePath = [];
var friend_recommend = [];


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


class Profile {
    constructor() {
        this.fullName = ''
        this.email = ''
        this.profile = ''
    }
}


class FriendRecommendSchedule {
    constructor() {
        this.queue = [];
        this.execute = [];
        this.count = 1
        this.countTarget = document.getElementById("friendsRecommend_friends_count")
        this.parent = document.getElementById('friendsRecommend_friends');

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
        <button id="newFriend" onClick="followInFeed('${friend.id}');" class="action-add">Follow</button>
        <button id="newFriend" onClick="removeFollowInFeed('${friend.id}');" class="action-remove">Remove</button>
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
                } else {
                    this.displayNone()
                }
            }
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
        if (this.parent.children.length > 0) {
            let len = this.parent.children.length
            for (let i = 0; i < len; i++) {
                this.parent.removeChild(this.parent.children[0]);
            }
        }
    }
}
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
                } else {
                    this.displayNone()
                }
            }
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



var FriendRecomSchedule = new FriendRecommendSchedule();
var FriendReqSchedule = new FriendRequiredSchedule();
var FriendConSchedule = new FriendContactsSchedule();
var profile = new Profile();

async function followInFeed(id) {
    await socket.emit("follow", {
        follow_id: id,
        name: profile.fullName
    });
    FriendRecomSchedule.removeQueueById(id)
    FriendRecomSchedule.schedule();
}
async function removeFollowInFeed(id) {
    FriendRecomSchedule.removeQueueById(id)
    FriendRecomSchedule.schedule();
}
async function acceptInFeed(id) {
    await socket.emit("accept", {
        follow_id: id,
        name: profile.fullName
    });
    FriendReqSchedule.removeQueueById(id)
    FriendReqSchedule.schedule();
}
async function removeAcceptInFeed(id) {
    FriendReqSchedule.removeQueueById(id)
    FriendReqSchedule.schedule();
}


async function clickMessage() {
    socket.send(document.getElementById('myMessage').value);
}


// start newFeed 
// var myDropzone1 = document.getElementById("myDropzone")
let myDropzone = new Dropzone("#myDropzone", {
    init: function() {
        dz = this;
        document.getElementById("newFeed-upload-btn").addEventListener("click", function handler(e) {
            e.preventDefault();
            dz.processQueue();
        });
        this.on("success", async function(file, responseText) {
            imagePath = responseText.imgPath
        });
        this.on("queuecomplete", async function(file) {
            socket.emit("newFeed", { imagePath: imagePath, content: document.getElementById("newFeed-content").value });
            socket.on("newFeedError", (reason) => {
                alertMini.fire({
                    icon: 'error',
                    title: 'Failed to create feed.'
                })
            });
            socket.on("newFeedSuccess", async(reason) => {
                document.getElementById("newFeed-content").value = "";
                this.removeAllFiles(true);
                alertMini.fire({
                    icon: 'success',
                    title: 'Successfully created the feed.'
                })
            });

        });

    },

    url: "/feeds/upload",
    autoProcessQueue: false,
    addRemoveLinks: true,
    uploadMultiple: true,
    parallelUploads: 30,
    paramName: "file",
    maxFilesize: 3,
    acceptedFiles: "image/*",
    maxFiles: 3,
    dictDefaultMessage: `Drop files here or click to upload.`,
    dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
    dictInvalidFileType: "You can't upload files of this type.",
    dictFileTooBig: "File is too big {{filesize}}. Max filesize: {{maxFilesize}}MiB.",
    dictResponseError: "Server error: {{statusCode}}",
    dictMaxFilesExceeded: "You can't upload any more files.",
    dictCancelUpload: "Cancel upload",
    dictRemoveFile: "Remove file",
    dictCancelUploadConfirmation: "You really want to delete this file?",
    dictUploadCanceled: "Upload canceled",
});

var newFeed_upload_btn = document.getElementById("newFeed-upload-btn")
var newFeed_content = document.getElementById("newFeed")
newFeed_content.addEventListener('mouseover', async() => {
    document.getElementById("myDropzone").classList.remove("d-none");
    document.getElementById("myDropzone").classList.add("d-block");
    document.getElementById("newFeed-upload-btn").classList.add("d-block");
    document.getElementById("newFeed-upload-btn").classList.remove("d-none");
})
newFeed_content.addEventListener('mouseout', async() => {
        document.getElementById("myDropzone").classList.remove("d-block")
        document.getElementById("myDropzone").classList.add("d-none");
        document.getElementById("newFeed-upload-btn").classList.remove("d-block")
        document.getElementById("newFeed-upload-btn").classList.add("d-none");
    })
    // end newfeed


socket.on("connect", async(msg) => {
    console.log(socket.id)
});

socket.on("disconnect", async(reason) => {
    if (reason === "io server disconnect") {
        socket.connect();
    }
});

socket.on("connect_error", async() => {
    setTimeout(() => {
        socket.connect();
    }, 1000);
});

socket.on('message', async(msg) => {
    alertMini.fire({
        text: `Received message : ${msg}`
    })
});

socket.on('profile', async(msg) => {
    profile.fullName = msg[0].fullName
    profile.email = msg[0].email
    profile.profile = msg[0].profile
});

socket.on('follower', async(msg) => {
    alertMini.fire({
        text: `${msg}`
    })
});

socket.on('Accept', async(msg) => {
    alertMini.fire({
        text: `${msg}`
    })
});

socket.on("newFollowError", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to Follow.'
    });
});

socket.on("newFollowSuccess", async(reason) => {
    alertMini.fire({
        icon: 'success',
        title: 'Successfully Follow.'
    });
});
socket.on("newAcceptError", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to Accept.'
    });
});

socket.on("newAcceptSuccess", async(reason) => {
    alertMini.fire({
        icon: 'success',
        title: 'Successfully Accept.'
    });
});

socket.on('friend_recommend', async(msg) => {
    await FriendRecomSchedule.addFriends(msg);
    await FriendRecomSchedule.schedule();
});

socket.on('friend_recommend_interrupt', async(msg) => {
    await FriendRecomSchedule.Interrupt(msg);
});

socket.on('friend_Required', async(msg) => {
    await FriendReqSchedule.addFriends(msg);
    await FriendReqSchedule.schedule();
});

socket.on('friend_Required_interrupt', async(msg) => {
    console.log("friend_Required_interrupt", msg)
    await FriendReqSchedule.Interrupt(msg);
});

socket.on('concacts', async(msg) => {
    await FriendConSchedule.addFriends(msg);
    await FriendConSchedule.schedule();
});

socket.on('concacts_interrupt', async(msg) => {
    console.log("concacts_interrupt", msg)
    await FriendConSchedule.Interrupt(msg);
});