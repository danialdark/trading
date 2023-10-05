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



    // const message = '~m~36~m~{"m":"set_data_quality","p":["low"]}';
    const auth = '~m~636~m~{"m":"set_auth_token","p":["eyJhbGciOiJSUzUxMiIsImtpZCI6IkdaeFUiLCJ0eXAiOiJKV1QifQ.eyJ1c2VyX2lkIjo1MzM4MDMzNiwiZXhwIjoxNjk2NDIyNTE0LCJpYXQiOjE2OTY0MDgxMTQsInBsYW4iOiIiLCJleHRfaG91cnMiOjEsInBlcm0iOiIiLCJzdHVkeV9wZXJtIjoiIiwibWF4X3N0dWRpZXMiOjIsIm1heF9mdW5kYW1lbnRhbHMiOjAsIm1heF9jaGFydHMiOjEsIm1heF9hY3RpdmVfYWxlcnRzIjoxLCJtYXhfc3R1ZHlfb25fc3R1ZHkiOjEsIm1heF9hY3RpdmVfcHJpbWl0aXZlX2FsZXJ0cyI6NSwibWF4X2FjdGl2ZV9jb21wbGV4X2FsZXJ0cyI6MSwibWF4X2Nvbm5lY3Rpb25zIjoyfQ.A67QeJ9gJO33nmpaU_RMj_n80MUZIOG5D8dNGSNjz2cchnrI7ebY2kLtwR-sft6784FpL5f1hX1nYpkdJhEz6e-VW6hz1NBSZLwpwveLKJudQaHlPxNwK_fpwsKWkR39USAALJo_zOsrTimAxVbFsMakBdtDjVgg-J3q3YGF1ig"]}'
    const session = '~m~55~m~{"m":"chart_create_session","p":["cs_DYd0vcG6Adfb",""]}'
    const timeZone = '~m~57~m~{"m":"switch_timezone","p":["cs_DYd0vcG6Adfb","Etc/UTC"]}'
    const symbol = '~m~144~m~{"m":"resolve_symbol","p":["cs_DYd0vcG6Adfb","sds_sym_1","={\\"adjustment\\":\\"splits\\",\\"session\\":\\"regular\\",\\"symbol\\":\\"BINANCE:BTCUSDT\\"}"]}'
    const series = '~m~83~m~{"m":"create_series","p":["cs_DYd0vcG6Adfb","sds_1","s1","sds_sym_1","1",50000,""]}'




    // Convert the message object to a JSON string
    // const messageString = JSON.stringify(message);

    // Send the JSON string as a message
    // ws.send(message);
    ws.send(auth);
    ws.send(session);
    ws.send(timeZone);
    ws.send(symbol);

    console.log("__________________________________________________________________")
    ws.send(series);
    console.log("__________________________________________________________________")
});


const candles = [];

const remover = (inputString) => {

    // Find the index of the first ~
    const firstTildeIndex = inputString.indexOf("~");

    // Find the index of the last ~
    const lastTildeIndex = inputString.lastIndexOf("~");

    // Check if both indices were found
    if (firstTildeIndex !== -1 && lastTildeIndex !== -1) {
        // Extract the substring without the portion between the first and last ~
        const result = inputString.substring(0, firstTildeIndex) + inputString.substring(lastTildeIndex + 1);
        const jsonedData = JSON.parse(result);
        if (jsonedData.m == "timescale_update") {
            // candles.push()
            jsonedData.p[1].sds_1.s.forEach(candle => {
                candles.push(candle.v)
                console.log(candle.v)

            });
        }
        // console.log(candles[candles.length - 1])
        // return result;
    } else {
        // Handle the case when ~ is not found
        console.log("No ~ found in the string.");
    }
}




// Function to extract JSON content from messages
function extractJSONFromMessages(text) {
    const regex = /(~m~\d+~m~{[^~]*}+)/g;
    const matches = text.match(regex);

    if (matches) {
        console.log("Series Loading Messages:");
        matches.forEach(match => {
            result = remover(match)
        });
    } else {
        console.log("No series_loading messages found.");
        console.log(text)
    }


}
// console.log(myResult)
var price = 0;
var vol = 0;

ws.on('message', (data) => {
    const refactored = data.toString('utf-8');
    console.log(refactored)



    if (!isNaN(refactored[refactored.length - 1])) {
        ws.send(refactored);
        console.log(refactored + " sent")
    } else {

    }



    // extractJSONFromMessages(refactored)


});

ws.on('close', (data) => {
    console.log(data);
    console.log('WebSocket connection closed');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
