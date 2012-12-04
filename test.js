// // Async task (same in all examples in this chapter)
// function async(arg, callback) {
//   console.log('do something with \''+arg+'\', return 1 sec later');
//   setTimeout(function() { callback(arg * 2); }, 3000);
// }
// // Final task (same in all the examples)
// function final() { console.log('Done', results); }

// // A simple async series:
// var items = [ 1, 2, 3, 4, 5, 6 ];
// var results = [];
// function series(item) {
//   if(item) {
//     async( item, function(result) {
//       results.push(result);
//       return series(items.shift());
//     });
//   } else {
//     return final();
//   }
// }
// series(items.shift());

// // writing async code in node
// // function start(toSay, callback) {
// // 	return process.nextTick(function() {
// // 		return callback(null, "hello")
// // 	})
// // }
// // start('i am the man', function(err, content) {
// // 	console.log(content)
// // })
// function end() {console.log("Done")}
// function series(toSay) {
// 	if(toSay) {
// 		async(toSay, function(result) {
// 			console.log(result)
// 			return series()
// 		})
// 	}
// 	else{
// 		end()
// 	}
// }

// function async(arg, callback) {
// 	console.log('do something with' + arg + 'return 1 second later')
// 	setTimeout(function() {callback(arg* 2 )}, 10000)
// }

// series(50)


// func() {
// 	newFunc()
// }

// func newFunc()


// (function hasen() {
// 	var returnValue = func2()
// 	console.log(returnValue);
// })()
// function func2() {
// 	for(var i = 0; i < 100000000000; i++) {

// 	}
// 	return 7
// }

console.log(ENV['variable'])