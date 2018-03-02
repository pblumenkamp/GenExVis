function parseDeseq2 (content, conditions) {
  content = content.split('\n')
  let header = content[0].split('\t')

  if (header.length !== 7) {
    console.warn('Incorrect header!')
  }

  let deseqResult = []
  for (let i = 1, lenLines = content.length; i < lenLines; i++) {
    let line = content[i].split('\t')

    deseqResult.push({
      gene_name: line[0],
      deseq2: [{
        conditions: new Set(conditions),
        baseMean: line[1],
        log2FoldChange: line[2],
        lfcSE: line[3],
        stat: line[4],
        pValue: line[5],
        pAdj: line[6]
      }]
    })
  }

  return deseqResult
}

export {parseDeseq2}
