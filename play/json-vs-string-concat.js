var Benchmark = require('benchmark')

var suite = new Benchmark.Suite

var object = {
    "quiz": {
        "sport": {
            "q1": {
                "question": "Which one is correct team name in NBA?",
                "options": [
                    "New York Bulls",
                    "Los Angeles Kings",
                    "Golden State Warriros",
                    "Huston Rocket"
                ],
                // "data": new Date(),
                "answer": "Huston Rocket"
            }
        },
        "maths": {
            "q1": {
                "question": "5 + 7 = ?",
                "options": [
                    "10",
                    "11",
                    "12",
                    "13"
                ],
                "answer": "12"
            },
            "q2": {
                "question": "12 - 8 = ?",
                "options": [
                    "1",
                    "2",
                    "3",
                    "4"
                ],
                "answer": "4"
            }
        }
    }
}

suite.add("String concat", function() {
    var t = generateJson(object)
})
.add("StringContactWithJoin", function() {
    var t = generateJsonWithJoin(object)
})
.add("With loop", function() {
    var t = generateJsonWithLoop(object)
})
.add("stringify", function() {
    var t = JSON.stringify(object)
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
// .on('complete', function() {
//     console.log(this)
// })
.run()

// var json = JSON.stringify(object)
// console.log(`String contat ${generateJson(object) === json}`)
// console.log(`StringContactWithJoin ${generateJsonWithJoin(object) === json}`)
// console.log(`WithLoop ${generateJsonWithLoop(object) === json}`)

// console.log(`String Concat:\n${generateJson(object)}`)
// console.log(`With Join:\n${generateJsonWithJoin(object)}`)
// console.log(`With Loop:\n${generateJsonWithLoop(object)}`)
// console.log(`stringify: ${json}`)

function generateJson(o) {
    // return `{"quiz":{"sport":{"q1":{"question":"${o.quiz.sport.q1.question}","options":["${o.quiz.sport.q1.options[0]}","${o.quiz.sport.q1.options[1]}","${o.quiz.sport.q1.options[2]}","${o.quiz.sport.q1.options[3]}"],"data":"${o.quiz.sport.q1.data.toISOString()}","answer":"${o.quiz.sport.q1.answer}"}},"maths":{"q1":{"question":"${o.quiz.maths.q1.question}","options":["${o.quiz.maths.q1.options[0]}","${o.quiz.maths.q1.options[1]}","${o.quiz.maths.q1.options[2]}","${o.quiz.maths.q1.options[3]}"],"answer":"${o.quiz.maths.q1.answer}"},"q2":{"question":"${o.quiz.maths.q2.question}","options":["${o.quiz.maths.q2.options[0]}","${o.quiz.maths.q2.options[1]}","${o.quiz.maths.q2.options[2]}","${o.quiz.maths.q2.options[3]}"],"answer":"${o.quiz.maths.q2.answer}"}}}}`
    return `{"quiz":{"sport":{"q1":{"question":"${o.quiz.sport.q1.question}","options":["${o.quiz.sport.q1.options[0]}","${o.quiz.sport.q1.options[1]}","${o.quiz.sport.q1.options[2]}","${o.quiz.sport.q1.options[3]}"],"answer":"${o.quiz.sport.q1.answer}"}},"maths":{"q1":{"question":"${o.quiz.maths.q1.question}","options":["${o.quiz.maths.q1.options[0]}","${o.quiz.maths.q1.options[1]}","${o.quiz.maths.q1.options[2]}","${o.quiz.maths.q1.options[3]}"],"answer":"${o.quiz.maths.q1.answer}"},"q2":{"question":"${o.quiz.maths.q2.question}","options":["${o.quiz.maths.q2.options[0]}","${o.quiz.maths.q2.options[1]}","${o.quiz.maths.q2.options[2]}","${o.quiz.maths.q2.options[3]}"],"answer":"${o.quiz.maths.q2.answer}"}}}}`
}

function generateJsonWithJoin(o) {
    // return `{"quiz":{"sport":{"q1":{"question":"${o.quiz.sport.q1.question}","options":["${o.quiz.sport.q1.options.join('","')}"],"data":"${o.quiz.sport.q1.data.toISOString()}","answer":"${o.quiz.sport.q1.answer}"}},"maths":{"q1":{"question":"${o.quiz.maths.q1.question}","options":["${o.quiz.maths.q1.options.join('","')}"],"answer":"${o.quiz.maths.q1.answer}"},"q2":{"question":"${o.quiz.maths.q2.question}","options":["${o.quiz.maths.q2.options.join('","')}"],"answer":"${o.quiz.maths.q2.answer}"}}}}`
    return `{"quiz":{"sport":{"q1":{"question":"${o.quiz.sport.q1.question}","options":["${o.quiz.sport.q1.options.join('","')}"],"answer":"${o.quiz.sport.q1.answer}"}},"maths":{"q1":{"question":"${o.quiz.maths.q1.question}","options":["${o.quiz.maths.q1.options.join('","')}"],"answer":"${o.quiz.maths.q1.answer}"},"q2":{"question":"${o.quiz.maths.q2.question}","options":["${o.quiz.maths.q2.options.join('","')}"],"answer":"${o.quiz.maths.q2.answer}"}}}}`
}

function generateJsonWithLoop(o) {
    // return `{"quiz":{"sport":{"q1":{"question":"${o.quiz.sport.q1.question}","options":${arrayToJson(o.quiz.sport.q1.options)},"data":"${o.quiz.sport.q1.data.toISOString()}","answer":"${o.quiz.sport.q1.answer}"}},"maths":{"q1":{"question":"${o.quiz.maths.q1.question}","options":${arrayToJson(o.quiz.maths.q1.options)},"answer":"${o.quiz.maths.q1.answer}"},"q2":{"question":"${o.quiz.maths.q2.question}","options":${arrayToJson(o.quiz.maths.q2.options)},"answer":"${o.quiz.maths.q2.answer}"}}}}`
    return `{"quiz":{"sport":{"q1":{"question":"${o.quiz.sport.q1.question}","options":${arrayToJson(o.quiz.sport.q1.options)},"answer":"${o.quiz.sport.q1.answer}"}},"maths":{"q1":{"question":"${o.quiz.maths.q1.question}","options":${arrayToJson(o.quiz.maths.q1.options)},"answer":"${o.quiz.maths.q1.answer}"},"q2":{"question":"${o.quiz.maths.q2.question}","options":${arrayToJson(o.quiz.maths.q2.options)},"answer":"${o.quiz.maths.q2.answer}"}}}}`
}

function arrayToJson(arr) {
    var length = arr.length
    var s = ""
    for (var i =0; i < length; i++) {
        if (i === 0) {
            s = `"${arr[0]}"`
        } else {
            s += `,"${arr[i]}"`
        }
    }

    return `[${s}]`
}

