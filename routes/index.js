var express = require('express');
var router = express.Router();
var fs = require('fs');
var CsvReadableStream = require('csv-reader');


/* GET home page. */
router.get('/', function (req, res, next) {
    const rows = [];
    var inputStream = fs.createReadStream(__dirname + '/../upload/games.csv', 'utf8');
    inputStream.pipe(CsvReadableStream({parseNumbers: true}))
        .on('data', function (row) {
            rows.push(row);
        })
        .on('end', function (data) {
            const stats = getStats(rows);
            res.render('index', {title: 'Express', stats:stats});
        });
});

Array.prototype.same = function(a) {
    return this.filter(function(i) {return a.indexOf(i) >= 0;});
};

function getCross(mainNums, rows, summs) {
    const result = [];
    summs.forEach(function (stat) {
        if(mainNums.indexOf(stat.num) >= 0) {
            return;
        }
        result.push({num: stat.num, rows: stat.rows.same(rows)})
    });
    return result;
}
function getStats(rows) {
    const summs = [];
    let rowIndex = 1;
    rows.forEach(function (row) {
        row.forEach(function (num) {
            const itemKey = num - 1;
            if (!summs[itemKey]) {
                summs[itemKey] = {num: num, cnt: 0, rows: []};
            }
            summs[itemKey]['cnt']++;
            summs[itemKey]['rows'].push(rowIndex);
        });
        rowIndex++;
    });
    const resp = [];
    summs.forEach(function (stat) {
        const mainNum = stat.num;
        const rows = stat.rows;
        resp.push({nums:[mainNum], rows:getCross([mainNum], rows, summs)});
    });
    const res = [];

    resp.forEach(function (stat) {
        const mainNums = stat.nums;
        stat.rows.forEach(function (item) {
            const nums = [...mainNums, item.num];
            res.push({nums:[...mainNums, item.num], rows:getCross(nums, item.rows, summs)});
        })
    });
    const used = {};
    const three = [];
    res.forEach(function (item) {
        const first = item.nums;
        item.rows.forEach(function (row) {
            const sec = row.num;
            if(row.rows.length > 1 ) {
                const sorted = [...first, sec].sort().join(' ');
                if(!used[sorted]) {
                    three.push({nums:[...first, sec], rows:row.rows});
                    used[sorted] = true;
                }
            }
        })
    });
    const fourres = [];
    three.forEach(function (stat) {
        const mainNums = stat.nums;
        fourres.push({nums:mainNums, rows:getCross(mainNums, stat.rows, summs)});
    });
    const fused = {};
    const four = [];
    fourres.forEach(function (item) {
        const first = item.nums;
        item.rows.forEach(function (row) {
            const sec = row.num;
            if(row.rows.length > 1 ) {
                const sorted = [...first, sec].sort().join(' ');
                if(!fused[sorted]) {
                    four.push({nums:[...first, sec], rows:row.rows});
                    fused[sorted] = true;
                }
            }
        })
    });


    const fiveres = [];
    four.forEach(function (stat) {
        const mainNums = stat.nums;
        fiveres.push({nums:mainNums, rows:getCross(mainNums, stat.rows, summs)});
    });
    const fiused = {};
    const five = [];
    fiveres.forEach(function (item) {
        const first = item.nums;
        item.rows.forEach(function (row) {
            const sec = row.num;
            if(row.rows.length > 1 ) {
                const sorted = [...first, sec].sort().join(' ');
                if(!fiused[sorted]) {
                    five.push({nums:[...first, sec], rows:row.rows});
                    fiused[sorted] = true;
                }
            }
        })
    });

    console.log(JSON.stringify(three.length));
    console.log(JSON.stringify(four.length));
    console.log(JSON.stringify(five.length));
    return four;
}

module.exports = router;