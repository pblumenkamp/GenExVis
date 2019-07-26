import {DGE} from './dge'

function parseDeseq2 (content, conditions, deseqResult = new DGE()) {
  content = content.split('\n');
  let header = content[0].split('\t');

  if (header.length !== 7) {
    throw new Error('Incorrect header in DESeq2 file found. File should contain 7 columns.')
  }

  for (let i = 1, lenLines = content.length; i < lenLines; i++) {
    if (!content[i].trim()) {
      continue
    }

    let line = content[i].split('\t');
    // Miri's IDEE, falls DESeq2 doch die .gene Konvention hat //
    //let nameArray=line[0].split('.');
    //let name=nameArray[0];
    let name = line[0].replace(/['"]+/g, '');

    deseqResult.addDESeq2Data(name, conditions[0], conditions[1], parseFloat(line[1]),
      parseFloat(line[2]), parseFloat(line[3]), parseFloat(line[4]), parseFloat(line[5]),
      parseFloat(line[6]))
  }

  return deseqResult
}

export {parseDeseq2}
