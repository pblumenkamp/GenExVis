![Javascript](https://img.shields.io/badge/Language-Javascript-blue.svg)
![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Release](https://img.shields.io/github/release/pblumenkamp/genexvis.svg)

# GenExVis (Gene Expression Visualizer)

## Contents
- [Description](#description)
- [Features](#features)
- [Usage](#usage)
  - [Installation](#installation)
  - [Using GenExVis](#using-genexvis)
- [Citation](#citation)
- [FAQ](#faq)

## Description
The gene expression visualizer (GenExVis) is an easy-to-use application for exploring and visualizing differential gene expression data created with DESeq2. It can display various charts and tables from simple count tables and DESeq2 result files without the necessity of uploading any data or installing any packages.

## Features
GenExVis was developed for a simple and fast first look at transcriptomic data analyzed with DESeq2. After importing a count table (e.g. from [featureCounts](http://subread.sourceforge.net/)) and the results of a DESeq2 comparison (see [Using GenExVis](#using-genexvis)), you can explore your data in various charts, a ranking by different criteria, or an overview table with filter options. GenExVis also supports the creation of gene subsets for specified charts containing only a selected number of genes.
 ![features_collage](https://user-images.githubusercontent.com/9703726/153231778-d91c9ee4-89a3-4f0b-b469-87210b36ef0e.svg)


## Usage
### Installation
There is nothing really to install. Just download GenExVis for your OS here and extract the downloaded archive. On Windows, start GenExVis per double-click on 'start_genexvis.exe' and on Linux per execution of 'start_genexvis'.

### Using GenExVis
After starting GenExVis, you need to define your experimental conditions and import your count table and DESeq2 comparison files.
![import_collage](https://user-images.githubusercontent.com/9703726/153021224-b18a5736-cae2-45c1-97bc-591fc0535f82.png)

#### Experimental conditions (top left image)
For a correct assignment of conditions to gene counts and DESeq2 data,  you have to register the experimental conditions first. Therefore, you can either register them by hand via the text field or by text file (one condition per line). GenExVis will try its best to auto-assign your count table columns and DESeq2 comparisons to these conditions. 

#### Count Table (top right image)
At the moment, GenExVis supports column-based tab-separated count tables with genes/features as rows and experiments/sequencing runs as columns. After choosing a file, you will get an overview of all columns in this file, and GenExVis will try to detect the gene name column (`--Feature name--`) and auto-assign a condition to experiment columns. This auto-assignment works via text recognition in the column header. So the auto-assignment will probably fail, if the condition names are ambiguous. If there are any columns in your count table which you don't want to import, just select `--Ignore--`. Besides all those entries corresponding to your count table, the first option is to select a normalization method. This is pure metadata and is only used by GenExVis to give the user option to import two count tables (normalized and raw). 

#### DESeq2 comparison (top right image)

## Citation

## FAQ
