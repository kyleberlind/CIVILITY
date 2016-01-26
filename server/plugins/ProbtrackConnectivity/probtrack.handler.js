var jsonfile = require('jsonfile');
var fs = require('fs');
var Promise = require('bluebird');
var Papa = require('papaparse');

module.exports = function(server,options)
{
    
    var handler = {};


    var readFile = function(filename){
        return new Promise(function(resolve, reject){
            fs.readFile( filename, 'utf8', function (error, data){
                if (error) reject(error);
                resolve(data);
            });
        });
    }

    handler.getMatrix = function (request, reply)
    {

        var array = ["/Users/danaele_puechmaille/Documents/ProbtrackBrainConnectivity/server/plugins/ProbtrackConnectivity/data/Average_triangularMatrix.txt", "/Users/danaele_puechmaille/Documents/ProbtrackBrainConnectivity/server/plugins/ProbtrackConnectivity/data/seedlist.txt"];

        Promise.map(array, readFile)
        .then(function(arrayData){

                var data = arrayData[0];
                var seedname = arrayData[1];

                var seeds = seedname.split('\n');
                var lines = data.split('\n');

                if( seeds.length != lines.length )
                  {
                      console.log("Seeds name list and Matrix file have wrong dimensions");
                  }
                var matrix = [];
                for(var line = 0; line < lines.length; line++){      
        //         console.log(lines[line]);
                     var rows = [];
                     var values = lines[line].split(' ');
                     for(var val = 0; val < values.length; val++){
            //             //console.log(values[val]);
                         rows.push(values[val]);
                     }
            //         console.log(rows.length);
                     if( rows.length != lines.length )
                     {
                         console.log("Matrix dimension wrong");        
                     }
                     matrix.push(rows);
                 }

                var matrixDescription = [];
                
                var sizeMat = seeds.length;
                for (var nbseed = 0; nbseed<sizeMat; nbseed++)
                {
        //          console.log(seeds[nbseed]);

                    var jsonLine = {"name": seeds[nbseed] };
                    var size = [];
                    var imports = [];

                    for (var j = 0; j<sizeMat; j++)
                    {
                        if(j != nbseed )
                        {
                            if(matrix[nbseed][j] > "0")
                            {
                                size.push(parseFloat(matrix[nbseed][j]));
                                imports.push(seeds[j]);
                            }
                        }

                    }

                    jsonLine.size = size;
                    jsonLine.imports = imports;
                    
                
                    matrixDescription.push(jsonLine);
                }
                //var wstream = fs.createWriteStream('/Users/danaele_puechmaille/Documents/ProbtrackBrainConnectivity/server/plugins/ProbtrackConnectivity/data/myJSONOutput.json');
                //wstream.write(matrixDescription);
               // console.log(arrayData);

                reply(matrixDescription);
        })
        .catch(reply);

    };


    handler.getConnectivityDescription = function (request, reply)
    {
        var result; 
        Table= ["/Users/danaele_puechmaille/Documents/ProbtrackBrainConnectivity/server/plugins/ProbtrackConnectivity/data/test.csv", "/Users/danaele_puechmaille/Documents/ProbtrackBrainConnectivity/server/plugins/ProbtrackConnectivity/data/seedTest.txt","/Users/danaele_puechmaille/Documents/ProbtrackBrainConnectivity/server/plugins/ProbtrackConnectivity/data/mat.txt"];
        Promise.map(Table, readFile)
        .then(function(arrayData){
          
          var logFile = arrayData[0];
          var listFile = arrayData[1];
          var data = arrayData[2];

          //Convert CSV file to array
          Papa.parse(logFile, 
            {
              comments: "#",
              header: true,
              complete: function(results) {
                Result=results;
                }
            });
       
          //Ordered list such as the matrix loaded
          var ListProceed = [];
          Result.data.forEach(function(name,i)
          {
            ListProceed.push(name.labelName);
          });
          
          console.log("Matrix list");
          console.log(ListProceed);

          
          //Ordered list attented for the plotting
          var ListOrdered = listFile.split('\n');
          var ListOrderedArray = [];
          //console.log(ListOrdered);
          ListOrdered.forEach(function(name,i)
          {

            var last = name.lastIndexOf(".");
            var KeyName = name.substring(last+1);
            ListOrderedArray.push(KeyName);
       
          });
          console.log("Ordered list");
          console.log(ListOrderedArray);

          //Create matrix (no order)
          var lines = data.split('\n');

          if(ListProceed.length == ListOrderedArray.length && ListOrderedArray.length == lines.length)
          {


          var matrix = [];
          for(var line = 0; line < lines.length; line++){      
        //         console.log(lines[line]);
                     var rows = [];
                     var values = lines[line].split(' ');
                     for(var val = 0; val < values.length; val++){
            //             //console.log(values[val]);
                         rows.push(values[val]);
                     }
            //         console.log(rows.length);
                     if( rows.length != lines.length )
                     {
                         console.log("Matrix dimension wrong");        
                     }
                     matrix.push(rows);
          }
          console.log("Matrix loaded");
          console.log(matrix);

          var NewMat = [];
          matrix.forEach(function(line,i)
          {
            var indexLine = ListProceed.indexOf(ListOrderedArray[i])  //1
            var row=matrix[indexLine];
            var NewRow =[];
            row.forEach(function(val,j)
            {
              var indexRow = ListProceed.indexOf(ListOrderedArray[j]);
              NewRow.push(row[indexRow]);
              //row.push(ListProceed.indexOf(ListOrderedArray[i]))
            });
            NewMat.push(NewRow);        
          });
          console.log("Matrix ordered");
          console.log(NewMat);


          var matrixDescription = [];
                
                var sizeMat = ListOrdered.length;
                for (var nbseed = 0; nbseed<sizeMat; nbseed++)
                {
        //          console.log(seeds[nbseed]);

                    var jsonLine = {"name": ListOrdered[nbseed] };
                    var size = [];
                    var imports = [];

                    for (var j = 0; j<sizeMat; j++)
                    {
                        if(j != nbseed )
                        {
                            if(NewMat[nbseed][j] > "0")
                            {
                                size.push(parseFloat(NewMat[nbseed][j]));
                                imports.push(ListOrdered[j]);
                            }
                        }

                    }

                    jsonLine.size = size;
                    jsonLine.imports = imports;
                    
                
                    matrixDescription.push(jsonLine);
                }
                console.log(matrixDescription);

          reply(matrixDescription);
        }
        else
        {
          console.log("Seeds name list and Matrix file have wrong dimensions");
          reply("KO");
        }

          
           })
        .catch(reply);

        
    }
    return handler; 
    
}