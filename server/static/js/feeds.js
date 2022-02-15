var socket = io.connect('http://127.0.0.1:5000/feeds');
var imagePath = []


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
            let content = document.getElementById("newFeed-content").value
            console.log("queuecomplete : ", imagePath)
            socket.emit("newFeed", { imagePath: imagePath, content: content });
            this.removeAllFiles(true);
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
    // $("#messages").append('<li>' + msg + socket.id + '</li>');
    console.log('Received message', msg);
});

function clickMessage() {
    console.log("click")
    socket.send(document.getElementById('myMessage').value);
}

function displayDate() {
    console.log(Date())
}