var socket = io.connect('http://127.0.0.1:5000/feeds');
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


class FriendRecommendSchedule {
    constructor() {
        this.queue = [];
        this.parent = document.getElementById('FriendsRecommend');
        this.child;
        this.setChild();
    }

    addFriend(friend) {
        this.queue.push(friend);
    }

    addFriends(arrar) {
        if (arrar.length > 0) {
            arrar.forEach((value) => {
                this.addFriend(value);
            })
        }
    }

    schedule() {
        this.removeChild()
        this.createElement(this.queue[0]);
        this.removeQueue();
        this.setChild();

    }
    removeQueue() {
        this.queue.shift();
    }

    setChild() {
        this.child = document.getElementById('FriendRecommend')
    }

    removeChild() {
        if (this.parent.children.length > 0) {
            this.parent.removeChild(this.parent.children[0]);
        }
    }

    createElement(friend) {
        let profile = friend.profile
        if (profile === null) { profile = '' }

        this.parent.innerHTML = `
        <div class="FriendRecommend" uid="${friend.id}">
        <img src="${profile}" alt="${friend.id}">
        <div class="fullname">${friend.fullName}</div>
        <button id="newFriend">Add Friend</button>
    </div>`;
    }

}

var FriendRecomSchedule = new FriendRecommendSchedule();

function clickMessage() {
    console.log("click")
    socket.send(document.getElementById('myMessage').value);
}

function displayDate() {
    console.log(Date())
}


socket.on("connect", () => {
    console.log(socket.id);
});

socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
        socket.connect();
    }
});

socket.on("connect_error", () => {
    setTimeout(() => {
        socket.connect();
    }, 1000);
});

socket.on('message', function(msg) {
    alertMini.fire({
        text: `Received message : ${msg}`
    })
});

socket.on('friend_recommend', function(msg) {
    FriendRecomSchedule.addFriends(msg);
    FriendRecomSchedule.schedule();
});

Dropzone.options.myDropzone = {
    init: function() {
        dz = this;
        document.getElementById("upload-btn").addEventListener("click", function handler(e) {
            e.preventDefault();
            dz.processQueue();
        });
        this.on("success", function(file, responseText) {
            imagePath = responseText.imgPath
        });
        this.on("queuecomplete", function(file) {
            socket.emit("newFeed", { imagePath: imagePath, content: document.getElementById("newFeed-content").value });
            socket.on("newFeedError", (reason) => {
                console.log('newFeedError')
                alertMini.fire({
                    icon: 'error',
                    title: 'Failed to create feed.'
                })
            });
            socket.on("newFeedSuccess", (reason) => {
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
};