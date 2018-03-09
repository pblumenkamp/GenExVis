import {DGE, Gene, ConditionPair, AnalysisDuplicateError} from '@/utilities/dge'

describe('Tests with empty DGE object', () => {
  test('add two analyses with the same gene and the same condition', () => {
    let dge = new DGE()
    dge.addDESeq2Data('gene_1', 'wt', 'mut', 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(() => {
      dge.addDESeq2Data('gene_1', 'wt', 'mut', 100, 2, 0.1, 0.2, 1, 2)
    }).toThrow()
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
      dge1.mergeDGEs(dge2)
    }).not.toThrow()
  })

  test('add 100,000 analysis to DGEs', () => {
    let dge = new DGE()
    for (let i = 0; i < 100000; i++) {
      dge.addDESeq2Data('gene_' + i, 'wt', 'mut', 100, 2, 0.1, 0.2, 0.001, 0.002)
    }
    expect(dge.length).toBe(100000)
  })

  test('register ConditionPairs in DGEs', () => {
    let dge = new DGE()
    expect(dge.conditionPairs.length).toBe(0)
    dge.addDESeq2Data('gene_1', 'wt', 'mut1', 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(dge.conditionPairs.length).toBe(1)
    dge.addDESeq2Data('gene_2', 'wt', 'mut2', 200, 2, 0.1, 0.2, 0.01, 0.002)
    expect(dge.conditionPairs.length).toBe(2)
    dge.addDESeq2Data('gene_2', 'wt', 'mut3', 200, 2, 0.1, 0.2, 0.01, 0.002)
    expect(dge.conditionPairs.length).toBe(3)
    dge.addDESeq2Data('gene_2', 'wt', 'mut1', 200, 2, 0.1, 0.2, 0.01, 0.002)
    expect(dge.conditionPairs.length).toBe(3)
  })
})

describe('Tests with Gene objects', () => {
  test('add DESeq2 analysis to gene', () => {
    let gene = new Gene('gene_1')
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(gene.hasOwnProperty('_deseq2')).toBe(true)
    expect(gene.getDESeq2Analyses().length).toBe(1)
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)
    expect(gene.getDESeq2Analyses().length).toBe(2)
  })

  test('add two identical DESeq2 analysis to gene', () => {
    let gene = new Gene('gene_1')
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(() => {
      gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    }).toThrow()
  })
})
