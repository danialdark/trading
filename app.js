const WebSocket = require('ws');

const serverUrl = 'wss://data.tradingview.com/socket.io/websocket?from=chart%2FTd7zSqMt%2F&date=2023_10_03-11_24&type=chart';

const headers = {
    Origin: 'https://www.tradingview.com',

};

const ws = new WebSocket(serverUrl, {
    headers: headers
});


const tokenMap = [
    { "BINANCE": "qs_NMWrtw0wr0l4" }
]


ws.on('open', () => {
    console.log('Connected to WebSocket server');



    const message = '~m~36~m~{"m":"set_data_quality","p":["low"]}';
    const auth = '~m~636~m~{"m":"set_auth_token","p":["eyJhbGciOiJSUzUxMiIsImtpZCI6IkdaeFUiLCJ0eXAiOiJKV1QifQ.eyJ1c2VyX2lkIjo1MzM4MDMzNiwiZXhwIjoxNjk2NDIyNTE0LCJpYXQiOjE2OTY0MDgxMTQsInBsYW4iOiIiLCJleHRfaG91cnMiOjEsInBlcm0iOiIiLCJzdHVkeV9wZXJtIjoiIiwibWF4X3N0dWRpZXMiOjIsIm1heF9mdW5kYW1lbnRhbHMiOjAsIm1heF9jaGFydHMiOjEsIm1heF9hY3RpdmVfYWxlcnRzIjoxLCJtYXhfc3R1ZHlfb25fc3R1ZHkiOjEsIm1heF9hY3RpdmVfcHJpbWl0aXZlX2FsZXJ0cyI6NSwibWF4X2FjdGl2ZV9jb21wbGV4X2FsZXJ0cyI6MSwibWF4X2Nvbm5lY3Rpb25zIjoyfQ.A67QeJ9gJO33nmpaU_RMj_n80MUZIOG5D8dNGSNjz2cchnrI7ebY2kLtwR-sft6784FpL5f1hX1nYpkdJhEz6e-VW6hz1NBSZLwpwveLKJudQaHlPxNwK_fpwsKWkR39USAALJo_zOsrTimAxVbFsMakBdtDjVgg-J3q3YGF1ig"]}'
    const session = '~m~55~m~{"m":"chart_create_session","p":["cs_kzjezFAHehza",""]}'
    const timeZone = '~m~57~m~{"m":"switch_timezone","p":["cs_kzjezFAHehza","Etc/UTC"]}'
    const symbol = '~m~144~m~{"m":"resolve_symbol","p":["cs_kzjezFAHehza","sds_sym_1","={\\"adjustment\\":\\"splits\\",\\"session\\":\\"regular\\",\\"symbol\\":\\"BINANCE:ETHUSDT\\"}"]}'
    const series = '~m~81~m~{"m":"create_series","p":["cs_kzjezFAHehza","sds_1","s1","sds_sym_1","1",300,""]}'



    // Convert the message object to a JSON string
    // const messageString = JSON.stringify(message);

    // Send the JSON string as a message
    ws.send(message);
    ws.send(auth);
    ws.send(session);
    ws.send(timeZone);
    ws.send(symbol);
    ws.send(series);
});



const remover = (inputString) => {

    // Find the index of the first ~
    const firstTildeIndex = inputString.indexOf("~");

    // Find the index of the last ~
    const lastTildeIndex = inputString.lastIndexOf("~");

    // Check if both indices were found
    if (firstTildeIndex !== -1 && lastTildeIndex !== -1) {
        // Extract the substring without the portion between the first and last ~
        const result = inputString.substring(0, firstTildeIndex) + inputString.substring(lastTildeIndex + 1);
        return result;
        console.log(result);
    } else {
        // Handle the case when ~ is not found
        console.log("No ~ found in the string.");
    }
}

// console.log(myResult)
var price = 0;
var vol = 0;

ws.on('message', (data) => {
    const refactored = data.toString('utf-8');




    if (!isNaN(refactored[refactored.length - 1])) {
        ws.send(refactored);
        console.log(refactored + " sent")
    } else {

    }



    const myResult = remover(refactored)
    // console.log(myResult)
    try {
        const jsonData = JSON.parse(myResult); // Parse the JSON string
        if (jsonData.hasOwnProperty("p")) {
            if (jsonData.p[1] != undefined) {
                if (jsonData.p[1].hasOwnProperty("sds_1")) {
                    if (jsonData.p[1].sds_1.hasOwnProperty("s") != undefined) {
                        console.log(jsonData.p[1].sds_1.s[0].v)

                    }
                }
            }
        }


        // console.log(jsonData.p[1].s)
        // if (jsonData.p != undefined) {
        //     if (jsonData.p[1].hasOwnProperty("v")) {
        //         if (jsonData.p[1].v.hasOwnProperty("bid")) {
        //             price = jsonData.p[1].v.bid
        //         }

        //         if (jsonData.p[1].v.hasOwnProperty("volume")) {
        //             vol = jsonData.p[1].v.volume 
        //         }

        //     }
        // }
        // console.log(`price is ${price} and vol is : ${vol}`)



    } catch (error) {
        // Handle JSON parsing errors
        console.error('Error parsing JSON:', error);
    }
});

ws.on('close', (data) => {
    console.log(data);
    console.log('WebSocket connection closed');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
