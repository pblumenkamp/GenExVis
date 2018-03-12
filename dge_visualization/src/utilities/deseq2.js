import {DGE} from './dge'

function parseDeseq2 (content, conditions, deseqResult = new DGE()) {
  content = content.split('\n')
  let header = content[0].split('\t')

  if (header.length !== 7) {
    console.warn('Incorrect header!')
  }

  for (let i = 1, lenLines = content.length; i < lenLines; i++) {
    let line = content[i].split('\t')

    let name = line[0]
    if (name.charAt(0) === '"' && name.charAt(str.length -1) === '"')
    {
      name = name.substr(1,str.length -2)
    }

    deseqResult.addDESeq2Data(name, conditions[0], conditions[1], {
      baseMean: line[1],
      log2FoldChange: line[2],
      lfcSE: line[3],
      stat: line[4],
      pValue: line[5],
      pAdj: line[6]
    })
  }

  return deseqResult
}

export {parseDeseq2}
