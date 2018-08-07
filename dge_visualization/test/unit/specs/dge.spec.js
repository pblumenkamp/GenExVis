import {DGE, Gene, DESeq2Analysis, ConditionPair, AnalysisDuplicateError} from '@/utilities/dge'

describe('Tests with empty DGE object', () => {
  test('add two analyses with the same gene and the same condition', () => {
    let dge = new DGE()
    dge.addDESeq2Data('gene_1', 'wt', 'mut', 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(() => {
      dge.addDESeq2Data('gene_1', 'wt', 'mut', 100, 2, 0.1, 0.2, 1, 2)
    }).toThrow()
  })

  test('check size of dge', () => {
    let dge = new DGE()
    expect(dge.size).toBe(0)
    dge.addDESeq2Data('gene_1', 'wt', 'mut', 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(dge.size).toBe(1)
    dge.addDESeq2Data('gene_1', 'wt', 'mut2', 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(dge.size).toBe(1)
    dge.addDESeq2Data('gene_2', 'wt', 'mut', 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(dge.size).toBe(2)
  })

  test('set and get seqRunMapping', () => {
    let dge = new DGE()
    dge.setSeqRunMapping({
      'A': 'WT',
      'B': 'Mut',
      'C': 'WT',
      'D': 'WT',
      'E': 'Mut',
      'F': 'Mut'
    })
    expect(dge.seqRuns).toEqual(
      {
        'A': 'WT',
        'B': 'Mut',
        'C': 'WT',
        'D': 'WT',
        'E': 'Mut',
        'F': 'Mut'
      }
    )
  })

  test('merge two DGEs with the same gene and the same condition', () => {
    let dge1 = new DGE()
    dge1.addDESeq2Data('gene_1', 'wt', 'mut', 100, 2, 0.1, 0.2, 0.001, 0.002)
    let dge2 = new DGE()
    dge2.addDESeq2Data('gene_1', 'wt', 'mut', 100, 2, 0.1, 0.2, 1, 2)
    expect(() => {
      dge1.mergeDGEs(dge2)
    }).toThrow()
  })

  test('merge two DGEs', () => {
    expect(() => {
      let dge1 = new DGE()
      dge1.addDESeq2Data('gene_1', 'wt', 'mut', 100, 2, 0.1, 0.2, 0.001, 0.002)
      let dge2 = new DGE()
      dge2.addDESeq2Data('gene_2', 'wt', 'mut', 100, 2, 0.1, 0.2, 1, 2)
      dge2.addDESeq2Data('gene_2', 'wt', 'mut2', 100, 2, 0.1, 0.2, 1, 2)

      dge1.mergeDGEs(dge2)
    }).not.toThrow()
  })

  test('add 100,000 genes with deseq2 data to DGEs', () => {
    let dge = new DGE()
    for (let i = 0; i < 100000; i++) {
      dge.addDESeq2Data('gene_' + i, 'wt', 'mut', 100, 2, 0.1, 0.2, 0.001, 0.002)
    }
    expect(dge).toHaveLength(100000)
  })

  test('register ConditionPairs in DGEs', () => {
    let dge = new DGE()
    expect(dge.conditionPairs).toHaveLength(0)
    dge.addDESeq2Data('gene_1', 'wt', 'mut1', 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(dge.conditionPairs).toHaveLength(1)
    dge.addDESeq2Data('gene_2', 'wt', 'mut2', 200, 2, 0.1, 0.2, 0.01, 0.002)
    expect(dge.conditionPairs).toHaveLength(2)
    dge.addDESeq2Data('gene_2', 'wt', 'mut3', 200, 2, 0.1, 0.2, 0.01, 0.002)
    expect(dge.conditionPairs).toHaveLength(3)
    dge.addDESeq2Data('gene_2', 'wt', 'mut1', 200, 2, 0.1, 0.2, 0.01, 0.002)
    expect(dge.conditionPairs).toHaveLength(3)
  })

  test('add count data', () => {
    let dge = new DGE()

    expect(dge.normalizationMethods).toHaveLength(0)
    dge.addUnnormalizedCountData('gene_1', 'WT', {a: 1, b: 10, c: 100})
    dge.addUnnormalizedCountData('gene_2', 'WT', {a: 2, b: 20, c: 200})
    dge.addUnnormalizedCountData('gene_1', 'Mut', {d: 10, e: 100, f: 1000})
    dge.addUnnormalizedCountData('gene_2', 'Mut', {d: 20, e: 200, f: 2000})
    expect(dge.normalizationMethods).toHaveLength(1)
    dge.addDeseq2CountData('gene_1', 'WT', {a: 3, b: 30, c: 300})
    dge.addDeseq2CountData('gene_2', 'WT', {a: 4, b: 40, c: 400})
    dge.addDeseq2CountData('gene_1', 'Mut', {d: 30, e: 300, f: 3000})
    dge.addDeseq2CountData('gene_2', 'Mut', {d: 40, e: 400, f: 4000})
    expect(dge.normalizationMethods).toHaveLength(2)

    expect(dge.getUnnormalizedCountDataToGene('gene_1', 'WT')).toEqual({a: 1, b: 10, c: 100})
    expect(dge.getUnnormalizedCountDataToGene('gene_2', 'WT')).toEqual({a: 2, b: 20, c: 200})
    expect(dge.getUnnormalizedCountDataToGene('gene_1', 'Mut')).toEqual({d: 10, e: 100, f: 1000})
    expect(dge.getUnnormalizedCountDataToGene('gene_2', 'Mut')).toEqual({d: 20, e: 200, f: 2000})
    expect(dge.getDeseq2CountDataToGene('gene_1', 'WT')).toEqual({a: 3, b: 30, c: 300})
    expect(dge.getDeseq2CountDataToGene('gene_2', 'WT')).toEqual({a: 4, b: 40, c: 400})
    expect(dge.getDeseq2CountDataToGene('gene_1', 'Mut')).toEqual({d: 30, e: 300, f: 3000})
    expect(dge.getDeseq2CountDataToGene('gene_2', 'Mut')).toEqual({d: 40, e: 400, f: 4000})

    expect(dge.getUnnormalizedCountDataToGene('gene_10', 'Mut')).toEqual({})
    expect(dge.getDeseq2CountDataToGene('gene_10', 'Mut')).toEqual({})
    expect(dge.getUnnormalizedCountDataToGene('gene_2', 'XYZ')).toEqual({})
    expect(dge.getDeseq2CountDataToGene('gene_2', 'XYZ')).toEqual({})

    expect(dge.getAllUnnormalizedCountDataByGene('gene_1')).toEqual({
      'WT': {a: 1, b: 10, c: 100},
      'Mut': {d: 10, e: 100, f: 1000}
    })
    expect(dge.getAllUnnormalizedCountDataByGene('gene_2')).toEqual({
      'WT': {a: 2, b: 20, c: 200},
      'Mut': {d: 20, e: 200, f: 2000}
    })
    expect(dge.getAllDeseq2CountDataByGene('gene_1')).toEqual({
      'WT': {a: 3, b: 30, c: 300},
      'Mut': {d: 30, e: 300, f: 3000}
    })
    expect(dge.getAllDeseq2CountDataByGene('gene_2')).toEqual({
      'WT': {a: 4, b: 40, c: 400},
      'Mut': {d: 40, e: 400, f: 4000}
    })

    expect(dge.getAllUnnormalizedCountDataByCondition('WT')).toEqual({
      'gene_1': {a: 1, b: 10, c: 100},
      'gene_2': {a: 2, b: 20, c: 200}
    })
    expect(dge.getAllUnnormalizedCountDataByCondition('Mut')).toEqual({
      'gene_1': {d: 10, e: 100, f: 1000},
      'gene_2': {d: 20, e: 200, f: 2000}
    })
    expect(dge.getAllDeseq2CountDataByCondition('WT')).toEqual({
      'gene_1': {a: 3, b: 30, c: 300},
      'gene_2': {a: 4, b: 40, c: 400}
    })
    expect(dge.getAllDeseq2CountDataByCondition('Mut')).toEqual({
      'gene_1': {d: 30, e: 300, f: 3000},
      'gene_2': {d: 40, e: 400, f: 4000}
    })

    expect(dge.getAllUnnormalizedCountData()).toEqual({
      'WT': {
        'gene_1': {a: 1, b: 10, c: 100},
        'gene_2': {a: 2, b: 20, c: 200}
      },
      'Mut': {
        'gene_1': {d: 10, e: 100, f: 1000},
        'gene_2': {d: 20, e: 200, f: 2000}
      }
    })
    expect(dge.getAllDeseq2CountData()).toEqual({
      'WT': {
        'gene_1': {a: 3, b: 30, c: 300},
        'gene_2': {a: 4, b: 40, c: 400}
      },
      'Mut': {
        'gene_1': {d: 30, e: 300, f: 3000},
        'gene_2': {d: 40, e: 400, f: 4000}
      }
    })

    expect(dge.getAllUnnormalizedCountDataByGene('gene_10')).toEqual({})
    expect(dge.getAllDeseq2CountDataByGene('gene_10')).toEqual({})
    expect(dge.getAllUnnormalizedCountDataByCondition('Mut123')).toEqual({})
    expect(dge.getAllDeseq2CountDataByCondition('Mut123')).toEqual({})

    // extend values
    dge.addUnnormalizedCountData('gene_1', 'WT', {x: 1, y: 10, z: 100})
    expect(dge.getUnnormalizedCountDataToGene('gene_1', 'WT')).toEqual({a: 1, b: 10, c: 100, x: 1, y: 10, z: 100})
    expect(dge.getAllUnnormalizedCountDataByGene('gene_1')).toEqual({
      'WT': {a: 1, b: 10, c: 100, x: 1, y: 10, z: 100},
      'Mut': {d: 10, e: 100, f: 1000}
    })

    dge.addDeseq2CountData('gene_1', 'Mut', {x: 1, y: 10, z: 100})
    expect(dge.getDeseq2CountDataToGene('gene_1', 'Mut')).toEqual({d: 30, e: 300, f: 3000, x: 1, y: 10, z: 100})
    expect(dge.getAllDeseq2CountDataByGene('gene_1')).toEqual({
      'WT': {a: 3, b: 30, c: 300},
      'Mut': {d: 30, e: 300, f: 3000, x: 1, y: 10, z: 100}
    })
  })
})

describe('Tests for DGE access', () => {
  let dge = new DGE()

  beforeAll(() => {
    dge.addDESeq2Data('gene_1', 'wt', 'mut1', 100, 2, 0.1, 0.2, 0.01, 0.002)
    dge.addDESeq2Data('gene_2', 'wt', 'mut1', 200, 2, 0.1, 0.2, 0.1, 0.2)
    dge.addDESeq2Data('gene_3', 'wt', 'mut1', 300, 2, 0.1, 0.2, 0.1, 0.2)
    dge.addDESeq2Data('gene_4', 'wt', 'mut1', 400, 2, 0.1, 0.2, 0.01, 0.002)
    dge.addDESeq2Data('gene_4', 'wt', 'mut2', 200, 2, 0.1, 0.2, 0.25, 0.3)
    dge.addDESeq2Data('gene_5', 'wt', 'mut2', 540, 2, 0.1, 0.2, 0.001, 0.002)
    dge.addDESeq2Data('gene_6', 'wt', 'mut2', 325, 2, 0.1, 0.2, 0.02, 0.4)
  })

  test('get specific gene', () => {
    expect(dge.getGene('gene_1').name).toBe('gene_1')
    expect(dge.getGene('gene_2').name).toBe('gene_2')
    expect(dge.getGene('gene_3').name).toBe('gene_3')
    expect(dge.getGene('gene_4').name).toBe('gene_4')
    expect(dge.getGene('gene_5').name).toBe('gene_5')
    expect(dge.getGene('gene_6').name).toBe('gene_6')

    expect(dge.getGene('gene_1').deseq2Analyses).toHaveLength(1)
    expect(dge.getGene('gene_2').deseq2Analyses).toHaveLength(1)
    expect(dge.getGene('gene_3').deseq2Analyses).toHaveLength(1)
    expect(dge.getGene('gene_4').deseq2Analyses).toHaveLength(2)
    expect(dge.getGene('gene_5').deseq2Analyses).toHaveLength(1)
    expect(dge.getGene('gene_6').deseq2Analyses).toHaveLength(1)
  })

  test('get significant DESeq2 genes', () => {
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.05, 'wt', 'mut1').size).toBe(2)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.5, 'wt', 'mut1').size).toBe(4)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.0005, 'wt', 'mut1').size).toBe(0)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.01, 'wt', 'mut1').size).toBe(2)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.05, 'wt', 'mut1', true).size).toBe(2)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.5, 'wt', 'mut1', true).size).toBe(4)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.0005, 'wt', 'mut1', true).size).toBe(0)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.02, 'wt', 'mut1', true).size).toBe(2)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.5, 'wt', 'mut2').size).toBe(3)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.01, 'wt', 'mut2').size).toBe(1)
  })

  test('get all DESeq2 gene names', () => {
    let geneNames = dge.getNamesOfAllGenesFromDESeq2('wt', 'mut1')
    expect(geneNames.size).toBe(4)
    expect(geneNames.has('gene_1')).toBe(true)
    expect(geneNames.has('gene_2')).toBe(true)
    expect(geneNames.has('gene_3')).toBe(true)
    expect(geneNames.has('gene_4')).toBe(true)
    geneNames = dge.getNamesOfAllGenesFromDESeq2('wt', 'mut2')
    expect(geneNames.size).toBe(3)
    expect(geneNames.has('gene_4')).toBe(true)
    expect(geneNames.has('gene_5')).toBe(true)
    expect(geneNames.has('gene_6')).toBe(true)
  })

  test('get all DESeq2 genes', () => {
    let smallDGE = dge.getAllGenesFromDESeq2('wt', 'mut1')
    expect(smallDGE.conditionPairs).toHaveLength(2)
    expect(smallDGE.geneNames.size).toBe(4)
    expect(smallDGE).toHaveLength(4)
    for (let geneName of smallDGE.geneNames) {
      let gene = smallDGE.getGene(geneName)
      let analysis = gene.getDESEQ2Analysis(new ConditionPair('wt', 'mut1'))
      expect(analysis.conditions.condition1).toBe('wt')
      expect(analysis.conditions.condition2).toBe('mut1')
    }
  })
})

describe('Tests for DGE subset', () => {
  let dge = new DGE()

  beforeAll(() => {
    dge.addDESeq2Data('gene_1', 'wt', 'mut1', 100, 2, 0.1, 0.2, 0.01, 0.002)
    dge.addDESeq2Data('gene_2', 'wt', 'mut1', 200, 2, 0.1, 0.2, 0.1, 0.2)
    dge.addDESeq2Data('gene_3', 'wt', 'mut1', 300, 2, 0.1, 0.2, 0.1, 0.2)
    dge.addDESeq2Data('gene_4', 'wt', 'mut1', 400, 2, 0.1, 0.2, 0.01, 0.002)
    dge.addDESeq2Data('gene_4', 'wt', 'mut2', 200, 2, 0.1, 0.2, 0.25, 0.3)
    dge.addDESeq2Data('gene_5', 'wt', 'mut2', 540, 2, 0.1, 0.2, 0.001, 0.002)
    dge.addUnnormalizedCountData('gene_1', 'wt', {a: 1, b: 10, c: 100})
    dge.addUnnormalizedCountData('gene_2', 'wt', {a: 2, b: 20, c: 200})
    dge.addUnnormalizedCountData('gene_1', 'mut1', {d: 10, e: 100, f: 1000})
    dge.addUnnormalizedCountData('gene_2', 'mut1', {d: 20, e: 200, f: 2000})
    dge.addUnnormalizedCountData('gene_3', 'wt', {a: 1, b: 10, c: 100})
    dge.addUnnormalizedCountData('gene_4', 'wt', {a: 2, b: 20, c: 200})
    dge.addUnnormalizedCountData('gene_3', 'mut1', {d: 10, e: 100, f: 1000})
    dge.addUnnormalizedCountData('gene_4', 'mut1', {d: 20, e: 200, f: 2000})
    dge.addUnnormalizedCountData('gene_5', 'wt', {a: 10, b: 100, c: 1000})
    dge.addUnnormalizedCountData('gene_5', 'mut1', {d: 20, e: 200, f: 2000})
    dge = dge.getSubset(['gene_1', 'gene_2', 'gene_3', 'gene_4'])
  })

  test('get specific gene', () => {
    expect(dge.getGene('gene_1').name).toBe('gene_1')
    expect(dge.getGene('gene_2').name).toBe('gene_2')
    expect(dge.getGene('gene_3').name).toBe('gene_3')
    expect(dge.getGene('gene_4').name).toBe('gene_4')

    expect(dge.getGene('gene_1').deseq2Analyses).toHaveLength(1)
    expect(dge.getGene('gene_2').deseq2Analyses).toHaveLength(1)
    expect(dge.getGene('gene_3').deseq2Analyses).toHaveLength(1)
    expect(dge.getGene('gene_4').deseq2Analyses).toHaveLength(2)
  })

  test('get significant DESeq2 genes', () => {
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.05, 'wt', 'mut1').size).toBe(2)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.5, 'wt', 'mut1').size).toBe(4)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.0005, 'wt', 'mut1').size).toBe(0)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.01, 'wt', 'mut1').size).toBe(2)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.05, 'wt', 'mut1', true).size).toBe(2)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.5, 'wt', 'mut1', true).size).toBe(4)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.0005, 'wt', 'mut1', true).size).toBe(0)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.02, 'wt', 'mut1', true).size).toBe(2)
    expect(dge.getNamesOfSignificantGenesFromDESeq2(0.5, 'wt', 'mut2').size).toBe(1)
  })

  test('get all DESeq2 gene names', () => {
    let geneNames = dge.getNamesOfAllGenesFromDESeq2('wt', 'mut1')
    expect(geneNames.size).toBe(4)
    expect(geneNames.has('gene_1')).toBe(true)
    expect(geneNames.has('gene_2')).toBe(true)
    expect(geneNames.has('gene_3')).toBe(true)
    expect(geneNames.has('gene_4')).toBe(true)
    geneNames = dge.getNamesOfAllGenesFromDESeq2('wt', 'mut2')
    expect(geneNames.size).toBe(1)
    expect(geneNames.has('gene_4')).toBe(true)
  })

  test('get all DESeq2 genes', () => {
    let smallDGE = dge.getAllGenesFromDESeq2('wt', 'mut1')
    expect(smallDGE.conditionPairs).toHaveLength(2)
    expect(smallDGE.geneNames.size).toBe(4)
    expect(smallDGE).toHaveLength(4)
    for (let geneName of smallDGE.geneNames) {
      let gene = smallDGE.getGene(geneName)
      let analysis = gene.getDESEQ2Analysis(new ConditionPair('wt', 'mut1'))
      expect(analysis.conditions.condition1).toBe('wt')
      expect(analysis.conditions.condition2).toBe('mut1')
    }
  })

  test('access count data', () => {
    expect(dge.getUnnormalizedCountDataToGene('gene_1', 'wt')).toEqual({a: 1, b: 10, c: 100})
    expect(dge.getUnnormalizedCountDataToGene('gene_2', 'wt')).toEqual({a: 2, b: 20, c: 200})
    expect(dge.getUnnormalizedCountDataToGene('gene_1', 'mut1')).toEqual({d: 10, e: 100, f: 1000})
    expect(dge.getUnnormalizedCountDataToGene('gene_2', 'mut1')).toEqual({d: 20, e: 200, f: 2000})

    expect(dge.getUnnormalizedCountDataToGene('gene_5', 'mut1')).toEqual({})
    expect(dge.getUnnormalizedCountDataToGene('gene_2', 'XYZ')).toEqual({})

    expect(dge.getAllUnnormalizedCountDataByGene('gene_1')).toEqual({
      'wt': {a: 1, b: 10, c: 100},
      'mut1': {d: 10, e: 100, f: 1000}
    })
    expect(dge.getAllUnnormalizedCountDataByGene('gene_2')).toEqual({
      'wt': {a: 2, b: 20, c: 200},
      'mut1': {d: 20, e: 200, f: 2000}
    })

    expect(dge.getAllUnnormalizedCountDataByCondition('wt')).toEqual({
      'gene_1': {a: 1, b: 10, c: 100},
      'gene_2': {a: 2, b: 20, c: 200},
      'gene_3': {a: 1, b: 10, c: 100},
      'gene_4': {a: 2, b: 20, c: 200}
    })
    expect(dge.getAllUnnormalizedCountDataByCondition('mut1')).toEqual({
      'gene_1': {d: 10, e: 100, f: 1000},
      'gene_2': {d: 20, e: 200, f: 2000},
      'gene_3': {d: 10, e: 100, f: 1000},
      'gene_4': {d: 20, e: 200, f: 2000}
    })

    expect(dge.getAllUnnormalizedCountData()).toEqual({
      'wt': {
        'gene_1': {a: 1, b: 10, c: 100},
        'gene_2': {a: 2, b: 20, c: 200},
        'gene_3': {a: 1, b: 10, c: 100},
        'gene_4': {a: 2, b: 20, c: 200}
      },
      'mut1': {
        'gene_1': {d: 10, e: 100, f: 1000},
        'gene_2': {d: 20, e: 200, f: 2000},
        'gene_3': {d: 10, e: 100, f: 1000},
        'gene_4': {d: 20, e: 200, f: 2000}
      }
    })

    expect(dge.getAllUnnormalizedCountDataByGene('gene_5')).toEqual({})
    expect(dge.getAllUnnormalizedCountDataByCondition('mut123')).toEqual({})
  })

  test('check ConditionPairs', () => {
    expect(dge.conditionPairs).toHaveLength(2)
    let newSubet = dge.getSubset(['gene_1', 'gene_2', 'gene_3', 'gene_5'])
    expect(newSubet.conditionPairs).toHaveLength(1)
  })
})

describe('Tests with Gene objects', () => {
  test('add DESeq2 analysis to gene', () => {
    let gene = new Gene('gene_1')
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(gene.hasOwnProperty('_deseq2_analyses')).toBe(true)
    expect(gene.deseq2Analyses).toHaveLength(1)
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)
    expect(gene.deseq2Analyses).toHaveLength(2)
  })

  test('add two identical DESeq2 analysis to gene', () => {
    let gene = new Gene('gene_1')
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(() => {
      gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    }).toThrow()
  })

  test('merge Genes with distinct analyses', () => {
    let gene1 = new Gene('gene_1')
    gene1.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    gene1.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)
    let gene2 = new Gene('gene_2')
    gene2.addDESEQ2Analysis(new ConditionPair('wt', 'mut3'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    gene2.addDESEQ2Analysis(new ConditionPair('wt', 'mut4'), 100, 2, 0.1, 0.2, 0.1, 0.2)
    gene1.mergeGenes(gene2)
    expect(gene1.hasOwnProperty('_deseq2_analyses')).toBe(true)
    expect(gene1.deseq2Analyses).toHaveLength(4)
    expect(gene1.name).toBe('gene_1')
  })

  test('merge Genes with identical analyses', () => {
    let gene1 = new Gene('gene_1')
    gene1.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    gene1.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)
    let gene2 = new Gene('gene_2')
    gene2.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    gene2.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)

    expect(() => {
      gene1.mergeGenes(gene2)
    }).toThrow()
  })

  test('register ConditionPairs for DESeq2 in Genes', () => {
    let gene1 = new Gene('gene_1')
    expect(gene1.deseq2ConditionPairs).toHaveLength(0)
    gene1.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(gene1.deseq2ConditionPairs).toHaveLength(1)
    gene1.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)
    expect(gene1.deseq2ConditionPairs).toHaveLength(2)
  })

  test('get Analysis to specific conditions', () => {
    let gene = new Gene('gene_1')
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.1)
    gene.addDESEQ2Analysis(new ConditionPair('mut1', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)

    expect(gene.getDESEQ2Analysis(new ConditionPair('wt', 'mut1')).pAdj).toBe(0.002)
    expect(gene.getDESEQ2Analysis(new ConditionPair('wt', 'mut2')).pAdj).toBe(0.1)
    expect(gene.getDESEQ2Analysis(new ConditionPair('mut1', 'mut2')).pAdj).toBe(0.2)

    expect(gene.getDESEQ2Analysis(new ConditionPair('mut2', 'mut1'))).toBeNull()
  })

  test('add count data to gene', () => {
    let gene = new Gene('gene_1')
    expect(gene.normalizationMethods).toHaveLength(0)
    gene.addCountData('deseq2', 'WT', [10, 20, 100])
    expect(gene.normalizationMethods).toHaveLength(1)
    expect(gene.normalizationMethods.indexOf('deseq2')).not.toBe(-1)
    gene.addCountData('unnormalized', 'WT', [50, 1, 30])
    expect(gene.normalizationMethods).toHaveLength(2)
    expect(gene.normalizationMethods.indexOf('deseq2')).not.toBe(-1)
    expect(gene.normalizationMethods.indexOf('unnormalized')).not.toBe(-1)
    gene.addCountData('deseq2', 'Mut', [10, 2, 1])
    expect(gene.normalizationMethods).toHaveLength(2)
    gene.addCountData('unnormalized', 'Mut', [5, 1, 30])
    expect(gene.normalizationMethods).toHaveLength(2)

    expect(gene.getCountData('deseq2', 'WT')).toEqual([10, 20, 100])
    expect(gene.getCountData('deseq2', 'Mut')).toEqual([10, 2, 1])
    expect(gene.getCountData('unnormalized', 'WT')).toEqual([50, 1, 30])
    expect(gene.getCountData('unnormalized', 'Mut')).toEqual([5, 1, 30])

    expect(gene.getAllCountData('deseq2')).toEqual({
      'WT': [10, 20, 100],
      'Mut': [10, 2, 1]
    })
    expect(gene.getAllCountData('unnormalized')).toEqual({
      'WT': [50, 1, 30],
      'Mut': [5, 1, 30]
    })
  })

})

describe('Test DESeq2Analysis', () => {
  test('create and access DESeq2Analysis', () => {
    let analysis = new DESeq2Analysis(new ConditionPair('wt', 'mut'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(analysis.conditions.condition1).toBe('wt')
    expect(analysis.conditions.condition2).toBe('mut')
    expect(analysis.baseMean).toBe(100)
    expect(analysis.log2FoldChange).toBe(2)
    expect(analysis.lfcSE).toBe(0.1)
    expect(analysis.stat).toBe(0.2)
    expect(analysis.pValue).toBe(0.001)
    expect(analysis.pAdj).toBe(0.002)
  })
})

describe('Test ConditionPairs', () => {
  test('create ConditionPairs', () => {
    let cp = new ConditionPair('wt', 'mut')
    let cp2 = new ConditionPair('wt', 'mut2')
  })

  test('compare ConditionPairs', () => {
    let cp = new ConditionPair('wt', 'mut')
    let cp2 = new ConditionPair('wt', 'mut2')
    let cp3 = new ConditionPair('wt', 'mut')
    expect(cp.isEqual(cp)).toBe(true)
    expect(cp.isEqual(cp3)).toBe(true)
    expect(cp.isEqual(cp2)).toBe(false)
  })
})
