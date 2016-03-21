var graph = require('fbgraph'),
    fs    = require('fs');

var callback = function callback(req, res) {
	var userid       = req.query.id,
      access_token = req.query.token,
	    ip           = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	console.log("\n[page "+": "+new Date().toLocaleString().substring(0, 33)+" ip: "+ip+" ]");
	console.log("userid= " + req.query.id);
	console.log("ACCESS_TOKEN= " + req.query.token);

	graph.setAccessToken(access_token);
	graph.get(userid, {fields: ""}, idValidator);

  function idValidator(err, res) {
    if(err && !res.from) {
      console.log("res === null ");
      console.dir(err);
      res.send({"error": {"message": JSON.stringify(err)}});
    } else {
      console.log("res.id: " + res.id);
      userid = res.id;

      var queryfields = "?fields=id,object_id,type,created_time,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true)&limit=250";
      graphGetRecursive(userid, "posts", queryfields, 100, processResponseJson);
    }
  };

  function processResponseJson(err, res) {
    if(err || !res) {
      if(!res){
        console.log("Err res_posts === null: ");
        console.dir(res);
      }
      console.dir(err);
      res.send({"error": {"message": JSON.stringify(err)}});
    } else {
      saveJson("posts_" + userid, res);
      // res.send(res_posts);
    }
  }
}

function graphGetRecursive(id, field_query, subfield_query, MAX_DEPTH, callback) {
	graph.get(id + '/' + field_query + '/' + subfield_query, function(err, res) {
    if(err || !res) {
      if(!res) {
        console.log("Error %s===null.", field_query);
				console.dir(res);
				callback({"error": {"message": "No sharedpost."}}, res);
			}
			callback(err, res);
			return;
		} else {
      var data_query = {"data": []};
      data_query.data = res.data;//data_query.data.concat(res.data);
      console.log("page "+1+" "+field_query+".length: " + data_query.data.length );

      recurpaging(res, 1, MAX_DEPTH, callback);
      return;
    }

    function recurpaging(res, depth, MAX_DEPTH, callback) {
    	if(depth >= MAX_DEPTH) {
    		console.log("[resursive paging: MAX_DEPTH");
    		console.log(field_query+".length: " + data_query.data.length );

    		callback(null, data_query);
    		return;
    	}

    	if(res.data && res.paging && res.paging.next){
    		graph.get(res.paging.next, function(err, res){
  	  		if(err) {callback(err, res);}
      		// page depth
      		depth++;
      		console.log("page "+depth+" "+field_query+".length: " + res.data.length);

      		data_query.data.push.apply(data_query.data, res.data);

      		setTimeout(function(){recurpaging(res, depth, MAX_DEPTH, callback);}, 2000);
    		});
    	}
    	else{
    		console.log("[resursive paging: end --------------]");
    		console.log(field_query+".length: " + data_query.data.length );
    		callback(null, data_query);
    	}
    };
  });
};

function saveJson(name, jsondata) {
	fs.writeFile(name + ".json", JSON.stringify(jsondata));
};

var exports = module.exports = {};
exports.callback = callback;
