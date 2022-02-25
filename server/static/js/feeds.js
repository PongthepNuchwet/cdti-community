Dropzone.autoDiscover = false;

window.addEventListener('DOMContentLoaded', (event) => {
    console.log(event)
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
            console.log("addFriends affter", this.queue, this.execute)
        }

        createElement(friend) {
            console.log('createElement')
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
            console.log('displayNone')
            this.parent.innerHTML = '<div class="none">none</div>'
        }

        Execute() {
            if (this.execute.length > 0) {
                for (let i = 0; i < this.execute.length; i++) {
                    if (this.execute[i] !== undefined) {
                        this.createElement(this.execute[i]);
                    } else {
                        this.displayNone()
                    }
                }
            }
        }

        schedule() {
            console.log('Before schedule')
            console.log('queue', this.queue)
            console.log('execute', this.execute)
            this.removeChild()
            if (this.execute.length < this.count) {
                if (this.queue.length > 0 || this.execute.length > 0) {
                    for (let i = 0; i < this.count; i++) {
                        if (this.queue[0] !== undefined) {
                            this.execute.push(this.queue.shift())
                        }
                    }
                    console.log('After schedule', this.queue, this.execute)
                    console.log('queue', this.queue)
                    console.log('execute', this.execute)
                    this.Execute()
                } else {
                    this.displayNone()
                }
            }
            this.displayCount()
        }
        removeQueue() {
            console.log('removeQueue')
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
            console.log("addFriends affter", this.queue, this.execute)
        }

        async createElement(friend) {
            console.log('createElement')
            let profile = friend.profile;
            if (profile === null) { profile = '' }
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
            console.log('displayNone')
            this.parent.innerHTML = '<div class="none">none</div>'
        }

        Execute() {
            if (this.execute.length > 0) {
                for (let i = 0; i < this.execute.length; i++) {
                    if (this.execute[i] !== undefined) {
                        this.createElement(this.execute[i]);
                    } else {
                        this.displayNone()
                    }
                }
            }
        }

        schedule() {
            console.log('Before schedule')
            console.log('queue', this.queue)
            console.log('execute', this.execute)
            this.removeChild()
            if (this.execute.length < this.count) {
                if (this.queue.length > 0 || this.execute.length > 0) {
                    for (let i = 0; i < this.count; i++) {
                        if (this.queue[0] !== undefined) {
                            this.execute.push(this.queue.shift())
                        }
                    }
                    console.log('After schedule', this.queue, this.execute)
                    console.log('queue', this.queue)
                    console.log('execute', this.execute)
                    this.Execute()
                } else {
                    this.displayNone()
                }
            }
            this.displayCount()
        }
        removeQueue() {
            console.log('removeQueue')
            this.execute.shift();
        }
        removeQueueById(id) {
            let temp = this.execute.filter((value) => { return value.id != id })
            this.execute = temp
        }

        removeChild() {
            console.log(this.parent, document.getElementById('friendsRequired_friends'))
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
            console.log("addFriends affter", this.execute)
        }

        async createElement(friend) {
            console.log('createElement')
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
            console.log('displayNone')
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
        }

        schedule() {
            this.removeChild()
            this.Execute()
            this.displayCount()
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
        console.log("click")
        await socket.emit("follow", {
            follow_id: id,
            name: profile.fullName
        });
        FriendRecomSchedule.removeQueueById(id)
        FriendRecomSchedule.schedule();
    }
    async function removeFollowInFeed(id) {
        console.log("click")
        FriendRecomSchedule.removeQueueById(id)
        FriendRecomSchedule.schedule();
    }
    async function acceptInFeed(id) {
        console.log("click")
        await socket.emit("accept", {
            follow_id: id,
            name: profile.fullName
        });
        FriendReqSchedule.removeQueueById(id)
        FriendReqSchedule.schedule();
    }
    async function removeAcceptInFeed(id) {
        console.log("click")
        FriendReqSchedule.removeQueueById(id)
        FriendReqSchedule.schedule();
    }


    async function clickMessage() {
        console.log("click")
        socket.send(document.getElementById('myMessage').value);
    }

    async function displayDate() {
        console.log(Date())
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
                    console.log('newFeedError')
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
        console.log("connect", socket.id);
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
        console.log("profile", msg)
        profile.fullName = msg[0].fullName
        profile.email = msg[0].email
        profile.profile = msg[0].profile
    });

    socket.on('follower', async(msg) => {
        console.log("follower", msg)
        alertMini.fire({
            text: `${msg}`
        })
    });

    socket.on('Accept', async(msg) => {
        console.log("Accept", msg)
        alertMini.fire({
            text: `${msg}`
        })
    });

    socket.on("newFollowError", async(reason) => {
        console.log('newFollowError');
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
        console.log('newAcceptError');
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
        console.log('friend_recommend', msg);
        await FriendRecomSchedule.addFriends(msg);
        await FriendRecomSchedule.schedule();
    });
    socket.on('friend_recommend_interrupt', async(msg) => {
        console.log('friend_recommend_interrupt', msg);
        await FriendRecomSchedule.Interrupt(msg);
    });

    socket.on('friend_Required', async(msg) => {
        console.log('friend_Required', msg);
        await FriendReqSchedule.addFriends(msg);
        await FriendReqSchedule.schedule();
    });
    socket.on('friend_Required_interrupt', async(msg) => {
        console.log('friend_Required_interrupt', msg);
        await FriendReqSchedule.Interrupt(msg);
    });

    socket.on('concacts', async(msg) => {
        console.log('concacts', msg);
        await FriendConSchedule.addFriends(msg);
        await FriendConSchedule.schedule();
    });
})