![Javascript](https://img.shields.io/badge/Language-Javascript-blue.svg)
![Vue.js](https://img.shields.io/badge/Language-Vue.js-blue.svg)
![NW.js](https://img.shields.io/badge/Framework-NW.js-blue.svg)
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
GenExVis was developed for a fast and straightforward first look at transcriptomic data analyzed with DESeq2. After importing a count table (e.g., from [featureCounts](http://subread.sourceforge.net/)) and the results of a DESeq2 comparison (see [Using GenExVis](#using-genexvis)), you can explore your data in various charts, a ranking by different criteria, or an overview table with filter options. GenExVis also supports the creation of gene subsets for specified charts containing only a selected number of genes.
 ![features_collage](https://user-images.githubusercontent.com/9703726/153231778-d91c9ee4-89a3-4f0b-b469-87210b36ef0e.svg)


## Usage
### Installation
There is nothing really to install. Just download GenExVis for your OS here and extract the downloaded archive. On Windows, start GenExVis per double-click on 'start_genexvis.exe' and on Linux per execution of 'start_genexvis'.

### Using GenExVis
After starting GenExVis, you need to define your experimental conditions and import your count table and DESeq2 comparison files.
![import_collage](https://user-images.githubusercontent.com/9703726/153021224-b18a5736-cae2-45c1-97bc-591fc0535f82.png)

#### Experimental conditions (top left image)
For a correct assignment of conditions to gene counts and DESeq2 data,  you have to register the experimental conditions first. Therefore, you can either import them by hand via the text field or by text file (one condition per line). GenExVis will try its best to auto-assign your count table columns and DESeq2 comparisons to these conditions. 

#### Count Table (top right image)
Currently, GenExVis supports column-based tab-separated count tables with genes/features as rows and experiments/sequencing runs as columns. After choosing a file, you will get an overview of all columns in this file, and GenExVis will try to detect the gene name column (`--Feature name--`) and auto-assign a condition to experiment columns. For this to work, GenExVis searches the column header for the registered conditions. If there are any columns in your count table which you don't want to import, just select `--Ignore--`. Besides all those entries corresponding to your count table, you also have to choose the normalization method of these counts. At the moment, this is pure metadata and is used by GenExVis to give the user option to work with two count tables in parallel (raw and normalized). 

#### DESeq2 comparison (top right image)
A DESeq2 comparison file (see example below) is a tab-separated text file containing the DESeq2 results of one comparison (Condition A vs. Condition B). These files can be automatically genereated in DESEq2 with the following commands: 
```R
res <- results(dds, contrast=c("condition","treated","untreated"))
write.table(res, file = 'treated_vs_untreated.tsv', sep = "\t", row.names = TRUE, col.names = NA)
```
If your filename is in the format `..._<condA_vs_<condB>.tsv` (e.g., `deseq2_WT_vs_Mut.tsv`), GenExVis can automatically assign the correct conditions for this comparison.

**Example:**
```
	baseMean	log2FoldChange	lfcSE	stat	pvalue	padj
WP_001386572.1	45.5357893182288	-0.05022152209245	0.306102011607642	-0.164067925684931	0.869677671214074	0.956740544473097
WP_000526115.1	20.3776406578987	0.408701212605221	0.386501810430336	1.05743673529024	0.290312313469477	0.575376359024185
WP_001264710.1	1029.58523755302	0.321829338807359	0.147298326663496	2.18488115986939	0.028897561237329	0.118153993536635
WP_000241663.1	297.019706092551	0.202059896894583	0.170039822767809	1.18830926547423	0.234711588669142	0.509999045693777
WP_000781042.1	460.507885104470	-0.044135348864798	0.164979488062347	-0.267520219532493	0.789068648359211	0.922804907369967
WP_001102391.1	1.21713032581618	-1.10175048525465	1.50339386731804	-0.732842210684352	0.463654673013483	NA
```

## Citation
Blumenkamp, P., Pfister, M., Diedrich, S., Brinkrolf, K., Jaenicke, S., Goesmann, A. - Curare and GenExVis: a versatile toolkit for analyzing and visualizing RNA-Seq data. BMC Bioinformatics 25, 138 (2024). https://doi.org/10.1186/s12859-024-05761-2

## FAQ
1. Contact and support: genexvis@computational.bio.uni-giessen.de
1. Issues: Bugs and issues can be filed [here](https://github.com/pblumenkamp/genexvis/issues)
