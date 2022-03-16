## 0.4.1
### Changed
- Columns in TopX charts are now sorted for a more constant experience.
- File name default changed to 'genexvis_export.csv' when exporting data.

### Fixed
- Fixed a crash when opening the overview table with large datasets.

## 0.4.0
Revamp of the whole software. Many fixes and additions to prepare GenExVis for public release.

## 0.3.0
### Added
- Added a check if a gene name column was selected on count table import.
- Added a validation check for conditions.
- Added counts-versus-counts scatter plot.
- Added documentation on "Import data" page.
- Added option to download all imported data as CSV.
- Added Top 10 ranking page.

### Changed
- Improved space management and scalability of site.
- Redesign DESeq2 overview page.

### Fixed
- The first gene is now visible in the "Overview" table.

## 0.2.0
### Added
- Added colored bars for log2 fold change in Deseq2 overview table.
- Added histogram for gene counts.
- Added histograms for p-value and log fold change.
- Added selection table for MA plot.
- Conditions are now removable via Import data page.

### Changed
- Enlarged size of all charts but heat map.
- Renamed and remodeled upload page.
- Renamed "Data Upload" to "Data Import" and removed the word "Upload" completly.

### Fixed
- Fixed bug that created empty data entries if a DESeq2 file contains empty lines.
- Fixed column duplications in "Deseq2 Overview" page.

## 0.1.0

### Added
- First release.


