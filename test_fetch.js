fetch('http://localhost:8080/listings/685114b2cbd7effd7a047b1d').then(async r => {
    const text = await r.text();
    console.log("STATUS:", r.status);
    const msg = text.match(/alert-heading[^>]*>(.*?)</);
    if (msg) console.log("MSG:", msg[1]);
    const stack = text.match(/mb-0[^>]*>([\s\S]*?)</);
    if (stack) console.log("STACK:", stack[1]);
}).catch(console.error);
