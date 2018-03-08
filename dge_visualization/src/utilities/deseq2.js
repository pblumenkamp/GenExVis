import {DGE} from './dge'

function parseDeseq2 (content, conditions, deseqResult = new DGE()) {
  content = content.split('\n')
  let header = content[0].split('\t')

  if (header.length !== 7) {
    console.warn('Incorrect header!')
  }

  for (let i = 1, lenLines = content.length; i < lenLines; i++) {
    let line = content[i].split('\t')

    deseqResult.addDESeq2Data(line[0], conditions[0], conditions[1], {
      baseMean: line[1],
      log2FoldChange: line[2],
      lfcSE: line[3],
      stat: line[4],
      pValue: line[5],
      pAdj: line[6]
    })

    /* deseqResult.push({
          gene_name: line[0],
          _deseq2: [{d
            conditions: new Set(conditions),
            baseMean: line[1],
            log2FoldChange: line[2],
            lfcSE: line[3],
            stat: line[4],
            pValue: line[5],
            pAdj: line[6]
          }]
        }) */
  }

  return deseqResult
}

export {parseDeseq2}
