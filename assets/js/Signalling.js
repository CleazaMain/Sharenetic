'use strict';

// Strict mode'u etkinleştir. Bu daha sıkı JavaScript kodu yazmanıza yardımcı olur.

Pusher.logToConsole = true;

// Pusher kütüphanesinin konsola log yazmasını etkinleştirir.

let channelName, pusher, base = "https://cleazamain.github.io/Sharenetic/";

// Değişkenleri tanımla: channelName (kanal adı), pusher (Pusher nesnesi), base (temel URL)

fetch(base + "/connect" + (localStorage.id ? `?id=${localStorage.id}` : ""), {
    "method": "GET",
    "headers": {
        // "cache-control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded"
    }
})
    .then(function (response) {
        // Sunucu yanıtını kontrol etmek için promise zinciri kullanılıyor.
        console.log(response.status);
        return response.json();
    }).then(function (data) {
        // Sunucudan dönen veriyi işlemek için promise zinciri kullanılıyor.
        if (!localStorage.id || localStorage.id != data.id){
            localStorage.id = data.id;
            updateTooltip();
        }
        channelName = data.channel;
        pusher = new Pusher('bda3528a8cfdae5663b2', {
            cluster: 'ap2'
        });
        subscribe();
    })
    .catch(function (error) {
        // Herhangi bir hata durumunda yakalanan hata.
        console.log(error.message);
    });

function subscribe() {
    // Pusher kanalına abone olma fonksiyonu
    window.channel = pusher.subscribe(channelName);
    window.channel.bind('pusher:subscription_succeeded', () => { console.log("subscribed") });
    window.channel.bind('pusher:subscription_error', () => { setTimeout(subscribe, 1000); });
    window.channel.bind('message', (mes) => signallingOnMessage(mes));
}

async function signal(mes) {
    // Sunucuya sinyal gönderme fonksiyonu
    return await fetch(base + "/connect", {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify({ "id": mes.id, "message": mes })
    });
}

// Remove in production start
function signallingDisconnect() {
    // Üretimde kaldırılmalı: Bağlantıyı kapatma işlemi
    fetch(base + "/disconnect?id=" + localStorage.id, {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
        .then(function (response) {
            console.log(response.status);
        })
        .catch(function (error) {
            console.log(error.message);
        });
}

// Tarayıcı penceresi kapatıldığında bağlantıyı kapatma işlemi
window.addEventListener('beforeunload', signallingDisconnect);
// Remove in production end
