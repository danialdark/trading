const WebSocket = require('ws');


const moment = require('moment');

const db = require('./db'); // Adjust the path as needed

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


    const insertCandlestickBatch = async (tableName, batch) => {
        try {
            await db.tx(async (t) => {
                for (const record of batch) {
                    const conflictQuery = `
                        INSERT INTO ${tableName} (symbol_id, symbol_name, open_time, open_price, high_price, low_price, close_price, volumn, close_time, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        ON CONFLICT (symbol_name, created_at)
                        DO UPDATE
                        SET 
                            open_time = EXCLUDED.open_time,
                            open_price = EXCLUDED.open_price,
                            high_price = EXCLUDED.high_price,
                            low_price = EXCLUDED.low_price,
                            close_price = EXCLUDED.close_price,
                            volumn = EXCLUDED.volumn,
                            close_time = EXCLUDED.close_time;
                    `;

                    await t.none(conflictQuery, [
                        record.symbol_id,
                        record.symbol_name,
                        record.open_time,
                        record.open_price,
                        record.high_price,
                        record.low_price,
                        record.close_price,
                        record.volumn,
                        record.close_time,
                        record.created_at
                    ]);

                    // console.log(`Data inserted or updated into ${tableName} for symbol_name: ${record.symbol_name}, created_at: ${record.created_at}`);
                }
            });
            console.log(`Data inserted or updated into ${tableName} for ${batch.length} records`);
        } catch (error) {
            console.error('Error:', error.message);
        }

    };



    const myResult = remover(refactored)
    // console.log(myResult)
    // try {

    const candles = []
    const shower = async (result) => {

        const jsonData = JSON.parse(result); // Parse the JSON string
        if (jsonData.hasOwnProperty("p")) {
            if (jsonData.p[1] != undefined) {
                if (jsonData.p[1].hasOwnProperty("sds_1")) {
                    if (jsonData.p[1].sds_1.hasOwnProperty("s") != undefined) {
                        candles.push(jsonData.p[1].sds_1.s[0].v);

                        const candlestickBatch = [];

                        const candlestickData = candles.map(item => {
                            const timestampSeconds = item[0]; // Unix timestamp in seconds
                            const timestampMilliseconds = timestampSeconds * 1000; // Convert to milliseconds
                            const formattedDateTime = moment(timestampMilliseconds).format('YYYY-MM-DD HH:mm:ss');

                            return {
                                symbol_id: 1,
                                symbol_name: "BTCUSDT",
                                open_time: timestampMilliseconds,
                                open_price: item[1],
                                high_price: item[2],
                                low_price: item[3],
                                close_price: item[4],
                                volumn: item[5],
                                close_time: timestampMilliseconds, // Assuming each candlestick is for 1 minute
                                created_at: formattedDateTime,
                            };
                        });

                        candlestickBatch.push(...candlestickData);



                        await insertCandlestickBatch("one_minut_spot_candles", candlestickBatch);

                    }
                }
            }
        }



    }


    shower(myResult)


    // } catch (error) {
    //     // Handle JSON parsing errors
    //     console.error('Error parsing JSON:', error);
    // }
});

ws.on('close', (data) => {
    console.log(data);
    console.log('WebSocket connection closed');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
