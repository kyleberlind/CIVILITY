import os.path
import json
import numpy as np
from pprint import pprint
from sys import argv
# add arg parse.


def writeSeedList(args):
    #args : SUBJECT_DIR, ${overlapFlag}, JSONTABLE filename, number_ROIS
    subject_dir = argv[1] 
    overlapName = argv[2] 
    jsonFile = argv[3] 
    nb_ROIS = argv[4]
    #need to create flags for the parameter
    
    DIR_Surfaces = subject_dir + '/OutputSurfaces' + overlapName + '/labelSurfaces/'
    
    #Open Json file and parse 
    with open(jsonFile) as data_file:    
        data = json.load(data_file)
    
    #Create file for seedList
    seedPath = subject_dir + '/seeds.txt'
    seedList = open(seedPath, 'w')
    
    #Put all MatrixRow to -1 
    for seed in data:
      seed['MatrixRow']=-1
    
    seedID = 0 
    #For each file in DIR
    for i in range(int(nb_ROIS)):
        numberStr = str(i+1)
        file = DIR_Surfaces + numberStr + ".asc"
        val = os.path.isfile(file)
        if (val == True):
          #Write in seedList Path 
          seedList.write(file + "\n")
          seedID = seedID + 1
          #Update JSON file : 'MatrixRow'
          for j in data:
            if(j['AAL_ID'] == i+1):
              j['MatrixRow'] = seedID
         
    seedList.close()
    
    #Update JSON file 
    with open(jsonFile, 'w') as txtfile:
        json.dump(data, txtfile, indent = 2)
    
    
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='HERE PUT DESCRIPTION AND LINK GITHUB')

    parser.add_argument("--SUBJECT", help = "subject data. ex: neo-0029-1-1year", type = str) # SUBJECT=$1  #ex : neo-0029-1-1year
    parser.add_argument("--DWI", help = "DWI data", type = str)# DWI=$2
    parser.add_argument("--DWIConvert", help = "DWI Convert", default = None, type = str)#DWIConvert=/Applications/Slicer.app/Contents/lib/Slicer-4.8/cli-modules/DWIConvert#??? what is this pathway???
    args = parser.parse_args()
    writeSeedList(args)
