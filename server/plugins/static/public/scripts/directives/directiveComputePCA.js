
angular.module('brainConnectivity')
.directive('computePca', function($routeParams,$location,clusterpost, probtrack){

function link($scope,$attrs,$filter){

$scope.matrixDimension = 0;
 $scope.param = {}; 
 $scope.viewPlot = false;
 $scope.valueK = 0;
 $scope.isMean = true;
 $scope.jobInListOK = false;
 $scope.clickRunPCA = false;

 $scope.parcellationChose = {
    type : "useTableFile"
 };

  $scope.jobsSelectedPCA = [];
  $scope.listReconstructMatrix = [];

  $scope.jobInList = function(){
        $scope.jobInListOK = false;
       _.each($scope.jobsSelectedPCA, function(v,i){
            if(v.type == "job")
            {
                
                $scope.jobInListOK = true;
            }
       })
       if( $scope.jobInListOK == false)
       {
        $scope.parcellationChose.type = "useTableFile";
       }
  }
 $scope.getMatrixK = function(Kvalue){

    var matrix = [];
        _.each($scope.listReconstructMatrix, function(value, key){
            
            console.log(value);
            console.log(value.Kvalue.toString(),$scope.valueK);
            if(value.Kvalue.toString() == $scope.valueK)
            {
                console.log("EQUAAAAL",value.matrix);
                matrix = value.matrix;
            }
        })
        return matrix;
 }

  $scope.plotDataCircle = function(){

    if($scope.valueK == "0" || $scope.valueK == 0)
    {
        $scope.isMean = true;
    } 
    else
    {
        $scope.isMean = false;
    } 
    $scope.viewCirclePlot = true;
    $scope.matrixOut = $scope.getMatrixK($scope.valueK);
    if($scope.clickRunPCA == true &&  $scope.parcellationChose.type=="useTableFile"  )
    {
        $scope.tableDescription = JSON.parse($scope.contentJ);
    }
    else if($scope.clickRunPCA == true &&  $scope.parcellationChose.type=="useTableJob")
    {
        console.log( $scope.jobsSelectedPCA );
        console.log( $scope.jobsSelectedPCA[0]);
        $scope.tableDescription = $scope.jobsSelectedPCA[0].parcellationTable;
    }
    console.log($scope.matrixOut, $scope.tableDescription);

    $scope.plotBrainConnectivityJobDone();
     }

    $scope.plotBrainConnectivityJobDone = function(){

     var matrix_norm = $scope.matrixOut ;
    
     var AALObject =  $scope.tableDescription;
     if($scope.tableDescription == undefined) {
        console.error("No table description read ");
        return false;
     }

                var table_Matrix = [];
                var listFDT = [];
                var listVisuOrder = [];
                var coordList = {};
                var MaxvisuOrder = 0;

                for(var i=0 ; i < matrix_norm.length ; i++)
                {
                  listFDT.push({});
                }

                for ( var seed in AALObject)
                {
                  var matrixRow = AALObject[seed]["MatrixRow"];
                  if(matrixRow != "-1")
                  {
                    //console.log(AALObject[seed]["MatrixRow"]);
                    listFDT[matrixRow-1] = AALObject[seed]["VisuHierarchy"] + AALObject[seed]["name"];
                    var visuorder = AALObject[seed]["VisuOrder"];
                    //console.log(visuorder);
                    if(visuorder > MaxvisuOrder )
                    {
                      MaxvisuOrder = visuorder;
                    }
                    table_Matrix.push(AALObject[seed]);
                  }
                  else
                  {
                    //Don't use
                  }
                  
                }
                for(var i=0 ; i < MaxvisuOrder ; i++)
                {
                  listVisuOrder.push("");
                }
                for ( var seed in table_Matrix)
                {
                  
                  var visuOrder = table_Matrix[seed]["VisuOrder"];
                  if(visuOrder != "-1")
                  {
                    //console.log("hello");
                    var name = table_Matrix[seed]["VisuHierarchy"] + table_Matrix[seed]["name"];
                    if(table_Matrix[seed]["coord"] != undefined)
                    {
                      var coordX = table_Matrix[seed]["coord"][0];
                      var coordY = table_Matrix[seed]["coord"][1];
                      var coordZ = table_Matrix[seed]["coord"][2];
                      var seedInfo = {"name" : name,  "x": coordX, "y": coordY, "z": coordZ};

                    }
                    else 
                    {
                      var seedInfo = {"name" : name};
                    }
                    listVisuOrder[visuOrder-1] = seedInfo
                    //listVisuOrder[visuOrder-1]=table_Matrix[seed]["VisuHierarchy"] + table_Matrix[seed]["name"];
                  } 
                  else
                  {
                    //Don't use
                  }  
                }

                //console.log("List visu order" + listVisuOrder);
                //console.log("List fdt" + listFDT);

                var NewMat = [];
                matrix_norm.forEach(function(line,i)
                {
                var indexLine = listFDT.indexOf(listVisuOrder[i]["name"])  //1
                if(indexLine != -1)
                {
                  var row = matrix_norm[indexLine];
                  var NewRow =[];
                  row.forEach(function(val,j)
                  {
                    var indexRow = listFDT.indexOf(listVisuOrder[j]["name"]);
                    if(indexRow  != -1)
                    {
                      NewRow.push(row[indexRow]);
                    }      
                  });
                  NewMat.push(NewRow); 
                }                       
             });
            
            console.log("Matrix ordered");
            console.log(NewMat.length);

            var returnJSONobject = {"matrix" : NewMat, "listOrdered" : listVisuOrder}
            console.log(listVisuOrder);
            console.log(returnJSONobject);

            $scope.ButtonClicked = true;
            $scope.plotVisible = true;
            $scope.plotParametersValues = {};
            $scope.plotParametersValues.link1 = "";
            $scope.plotParametersValues.link2 = "";
            $scope.plotParametersValues.threshold = 0.1;
            $scope.plotParametersValues.method = [true,false,false];
            $scope.plotParametersValues.tension = 85;
            $scope.plotParametersValues.diameter = 960
            $scope.plotParametersValues.upperValue = 1;
            $scope.plotParametersValues.data = returnJSONobject;
            $scope.NewPlot;
  }
  $scope.showContentJson = function($fileContent){
        $scope.contentJ = $fileContent;
    };

$scope.showContentMatrix = function($fileContent){
        $scope.contentM = $fileContent;
    };

$scope.addMatrixToList = function(){

    if($scope.param.subjectID != undefined && $scope.param.subjectID.length > 0)
    {

      var param = {
        id : "none",
        subject : $scope.param.subjectID,
        type : "matrix added",
        matrix : $scope.contentM
      };

      $scope.jobsSelectedPCA.push(param);
    }
    else
    {
        alert("You must specified a subject name ! ");
        return false;
    }
}

$scope.removeFromList = function(job){
    var index = $scope.jobsSelectedPCA.indexOf(job); 
    var id = $scope.jobsSelectedPCA[index].id ;
    var a = document.getElementById("checkbox_" + id);
    $scope.jobsSelectedPCA.splice( $scope.jobsSelectedPCA.indexOf(job) , 1 ); 
}

$scope.readMatrixAsDoubleArray = function(matrix){

    var lines = matrix.split('\n');
    var matrix = [];
    for(var line = 0; line < lines.length; line++){      
        // console.log(lines[line]);
            var rows = [];
            var values = lines[line].split('  ');
            for(var val = 0; val < values.length; val++){
              if(values[val] != ""){
                  //console.log(values[val]);
                   rows.push(values[val]);
                }           
              }
              if(rows.length>0)
              {
                  matrix.push(rows);
              }
    }
    return matrix;
}

$scope.normalizedMatrix = function(matrix){

    var waytotal = [];
    var matrix_norm = [];
    for( var k=0 ; k < 2 ; k++ )
    {
        for(var i = 0 ; i < matrix.length ; i++)
        {
            var row = [];

            var total=0;
            var val_norm = 0.0;

            for(var j = 0 ; j < matrix[i].length ; j++)
            {
                if(k==0)
                {
                    total += parseFloat(matrix[i][j]);
                }
                else
                {
                    var val = parseFloat(matrix[i][j]);
                    val_norm = val/waytotal[i];
                    row.push(val_norm);
                }
            }
            if(i == 0){
                var sizeLine = row.length;
            }
            else
            {
                if(row.length != sizeLine)
                {
                    console.error("Matrix error dimension ");
                }
            }
            if(k==0)
            {
                waytotal.push(total);
            }
            else
            {
                matrix_norm.push(row);
            }
        }
        console.log(waytotal);
    }

    console.log(waytotal.length);
    return matrix_norm;
}

$scope.matrixAsVector = function(matrix){

    var vector = [];
    console.log(matrix.length);

    for(var  i=0 ; i < matrix.length ; i++)
    {
        for(var  j=0 ; j < matrix.length ; j++)
        {
        vector.push(parseFloat(matrix[i][j]));
        }
    }
    console.log(vector.length);
    return vector; 
}

$scope.numberOfComponents = function(singularValues){
    
    var  sumEigenValues = 0 ;
    for(var i = 0 ; i < singularValues.length ; i++)
    {
        sumEigenValues += singularValues[i];
    }
   console.log(sumEigenValues);
    var nbCompo = 0;
    var cumulativeVariance = 0 ;
    for(var i = 0 ; i < singularValues.length ; i++)
    {
        nbCompo ++;
        cumulativeVariance  +=  singularValues[i] / sumEigenValues ;
        if(cumulativeVariance > 0.90)
        {
            return nbCompo;
        }
    }
}

$scope.runPCA = function(){

    console.log("Compute PCA ");
    if($scope.parcellationChose.type == "useTableFile" && $scope.contentJ == undefined)
    {
        alert("Please select a parcellation file");
        return false;
    }
    else if( $scope.parcellationChose.type == "useTableJob")
    {
            //To do 
    }
    $scope.clickRunPCA = true;

    $scope.listReconstructMatrix = [];

    if($scope.jobsSelectedPCA.length >= 2)
    {
       //Create matrix of all vectors 
    var vectorList = [];
    var matrixList =[];

    _.each($scope.jobsSelectedPCA,function(value,key){

        //Read matrix as double array
        var matrixArray = $scope.readMatrixAsDoubleArray(value.matrix);
        console.log(matrixArray);
        matrixList.push(matrixArray);
    })
    console.log(matrixList);
    var matrixSizeCol =  matrixList[0].length;
    var matrixSizeRow = matrixList[0][0].length

    if(matrixSizeRow != matrixSizeCol ){
        console.error("ERROR Matrix is not square : this is not a brain connectivty matrix");
    }

    //Check all matrix have same dimensions 
    matrixList.forEach(function(value,key){
        if(value.length != matrixSizeCol || value[0].length !=  matrixSizeRow)
        {
            console.error("Matrices don't have the same dimension - Compute PCA failed");
        }
    })


     matrixList.forEach(function(value,key){

        //FNormalized matrix
        var matrixNorm = $scope.normalizedMatrix(value);
        console.log(matrixNorm);
        //Make mastrix a single vector
        var vector = $scope.matrixAsVector(matrixNorm);
        console.log(vector);
        vectorList.push(vector);
    })
    var sizeVector = vectorList[0].length;
    console.log(sizeVector);

    vectorList.forEach(function(vect,i){
        if(vectorList[i].length != sizeVector) console.error("Matrices don't have the same dimension - Compute PCA failed")
    });

    console.log(vectorList.length);

    var dataset = numeric.transpose(vectorList);

    //Mean dataset (each matrix nodes)
    var meanDataset = math.mean(dataset,1);
    console.log(meanDataset);

    //Mean to center dataset (mean of each subject )
    var meanDataset2 = math.mean(dataset,0);
    console.log(meanDataset2);

    //Center dataset 
    var centerDataset = [];
    for(var i = 0 ; i < dataset.length ; i++)
    {
        var dataVect = numeric.sub(dataset[i],meanDataset2)
        centerDataset.push(dataVect);
    }
    var val = 1 / Math.sqrt( sizeVector - 1 );
    var centerDataset2 = [];
    centerDataset.forEach(function(row,i){
        var centVect = $scope.scalarMultiply(row,val)
        centerDataset2.push(centVect)
         })
    var svdRes = numeric.svd(centerDataset2);
    console.log("eigenvalues",svdRes.S);
    var nbCompo = $scope.numberOfComponents(svdRes.S);
    console.log(nbCompo);
    var UTranspose = numeric.transpose(svdRes.U);
    
 //   console.log("VECTTTT",vectReconstruct);
        for (var k=-10 ; k <= 10 ; k+=1)
        {
           var K = parseFloat(k)/10;
           var vectReconstruct = meanDataset;
           // var VTranspose = numeric.transpose(svdRes.V);
            for (var j = 0 ; j < nbCompo ; j++)
            {
                var scalar = K * Math.sqrt(svdRes.S[j]);
               var newVect = $scope.scalarMultiply(UTranspose[j],scalar)
              // var newVect = scalar * numeric.transpose(svdRes.V);
               //vectReconstruct += newVect;
              vectReconstruct = numeric.add(vectReconstruct,newVect);
            }
            console.log(vectReconstruct,K);
            //Delinearize vect 
            var id = 0;
            var matrixReconstruct = [];
             var line = [];
            vectReconstruct.forEach(function(val,i){
                line.push(val);
                if(line.length == 78){
                    matrixReconstruct.push(line);
                    line = [];
                }
                
            })
            /*for(var i = 0 ; i < matrixSizeRow ; i++)
            {
                var line = [] ;
                for(var j = 0 ; j < matrixSizeCol ; j++)
                {
                    line.push(vectReconstruct[i+j]);
                    id ++;
                }
                matrixReconstruct.push(line);
            }*/
            console.log(matrixReconstruct);
            var obj = {};
            obj.matrix = matrixReconstruct;
            obj.Kvalue = K;
            $scope.listReconstructMatrix.push(obj);
        }
        console.log($scope.listReconstructMatrix);
        $scope.plotVisible = true  ;
        $scope.viewPlot = true;
        $scope.plotDataCircle();
    }
    else
    {
        alert("Error : Not enough matrix to compute PCA - add more matrix (at least 2 matrices required)");
        return false;
    }
}

$scope.readTable = function(){
    if($scope.parcellationChose.type == "useTableFile")
    {
        $scope.viewInputTableFile = true;
    }
    else
    {
        $scope.viewInputTableFile = false;
    }
}


$scope.scalarMultiply = function(arr, multiplier) {
   var newArray = [];
   for (var i = 0; i < arr.length; i++)
   {
      newArray.push(arr[i] * multiplier);
   }
   return newArray;
}


$scope.$watch("valueK", function(){
        console.log("HelloWatch value K ", $scope.valueK);
        if($scope.clickRunPCA) $scope.plotDataCircle();
        
      });

$scope.$watch("parcellationChose.type", function(){
        console.log("HelloWatch parcellationChose.type ", $scope.parcellationChose.type);
        $scope.readTable();
        
      });
  $scope.$watchCollection("jobsSelectedPCA", function(){
        console.log("HelloWatch jobsSelectedPCA", $scope.jobsSelectedPCA);
       $scope.jobInList();
      });

};

return {
    restrict : 'E',
/*    scope: {
    	testID : "="
    },*/
    link : link,
    templateUrl: 'views/directives/directiveComputePCA.html'
}

});

