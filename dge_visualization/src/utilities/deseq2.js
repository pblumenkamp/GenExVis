import {DGE} from './dge'

function parseDeseq2 (content, conditions, deseqResult = new DGE()) {
  content = content.split('\n')
  let header = content[0].split('\t')

  if (header.length !== 7) {
    console.warn('Incorrect header!')
  }

  for (let i = 1, lenLines = content.length; i < lenLines; i++) {
    if (!content[i].trim()) {
      continue
    }

    let line = content[i].split('\t')

    let name = line[0]
    if (name.charAt(0) === '"' && name.charAt(name.length - 1) === '"') {
      name = name.substr(1, name.length - 2)
    }

    deseqResult.addDESeq2Data(name, conditions[0], conditions[1], parseFloat(line[1]),
      parseFloat(line[2]), parseFloat(line[3]), parseFloat(line[4]), parseFloat(line[5]),
      parseFloat(line[6]))
  }

  return deseqResult
}

export {parseDeseq2}
