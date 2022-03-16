var banlist = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/banlist');

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

banlist.on("connect", async(msg) => {
    console.log(banlist.id)
});

banlist.on("disconnect", async(reason) => {
    if (reason === "io server disconnect") {
        banlist.connect();
    }
});

banlist.on("connect_error", async() => {
    setTimeout(() => {
        banlist.connect();
    }, 1000);
});

banlist.on('message', async(msg) => {
    alertMini.fire({
        text: `Received message : ${msg}`
    })
});

class Banlist {
    constructor() {
        this.banlists = []
        this.container = document.getElementById('banlists')

    }

    createNone() {
        let elm = document.createElement('tr')
        elm.setAttribute('colspan', `4`)
        elm.setAttribute('class', `unban-none`)
        elm.innerHTML = 'None'
        this.container.appendChild(elm)
    }

    NotFound() {
        this.removeChild()
        this.createNone()
    }

    find_banlist_index(id) {
        return this.banlists.findIndex(banlist => banlist.id == id)
    }

    add(data) {
        if (data.length > 0) {
            for (let i = 0; i <= data.length - 1; i++) {
                this.banlists.push(data[i])
            }
        }
        console.log("🚀 ~ file: banlist.js ~ line 67 ~ banlist ~ constructor ~ this.banlists", this.banlists)
    }

    createElement(data, count) {
        let elm = document.createElement('tr')
        elm.setAttribute('id', `banlist_${data.id}`)
        let html = `<th scope="row">${count}</th>
        <td>${data.email}</td>
        <td>${data.fullName}</td>
        <td>
        <div class="Unbanned">
            <button type="submit" onClick="banlistOrganize.unBan(${data.id})" class="btn btn-primary btn-sm mb-3">UnBanned</button>
        </div>
        </td>`
        elm.innerHTML = html
        return elm

    }

    Organize() {
        this.removeChild()
        if (this.banlists.length > 0) {
            for (let i = 0; i <= this.banlists.length - 1; i++) {
                let banlist = this.createElement(this.banlists[i], i + 1)
                this.container.appendChild(banlist)
            }
        }
    }

    removeChild() {
        console.log("removeChild")
        if (this.container.children.length > 0) {
            let len = this.container.children.length
            for (let i = 0; i < len; i++) {
                this.container.removeChild(this.container.children[0]);
            }
        }
    }

    unBan_success(id) {
        let traget = document.getElementById(`banlist_${id}`)
        this.container.removeChild(traget)
        if (this.container.children.length < 1) {
            this.NotFound()
        }
    }

    unBan(id) {
        banlist.emit("unBan", {
            id: id,
        });
    }

}

var banlistOrganize = new Banlist();
banlist.on('banlist', async(msg) => {
    console.log("🚀 ~ file: banlist.js ~ line 214 ~ Banlist ~ banlist.on ~ msg", msg)
    banlistOrganize.add(msg)
    banlistOrganize.Organize()
});
banlist.on('NotFound', async(msg) => {
    console.log("🚀 ~ file: banlist.js ~ line 222 ~ Banlist ~ banlist.on ~ msg", msg)
    banlistOrganize.NotFound()
    console.log("banlistNotFound", msg)
});


banlist.on("unBan_error", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to unBan.'
    });
});

banlist.on("unBan_success", async(reason) => {
    console.log("🚀 ~ file: banlist.js ~ line 177 ~ banlist.on ~ reason", reason)
    banlistOrganize.unBan_success(reason.id)
    alertMini.fire({
        icon: 'success',
        title: 'Successfully unBan.'
    });
});