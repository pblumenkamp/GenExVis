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
      dge2.addDESeq2Data('gene_2', 'wt', 'mut2', 100, 2, 0.1, 0.2, 1, 2)

      dge1.mergeDGEs(dge2)
    }).not.toThrow()
  })

  test('add 100,000 analysis to DGEs', () => {
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
  });

  test('get significant DESeq2 genes', () => {
    expect(dge.getSignificantGenesFromDESeq2(0.05, 'wt', 'mut1')).toHaveLength(2)
    expect(dge.getSignificantGenesFromDESeq2(0.5, 'wt', 'mut1')).toHaveLength(4)
    expect(dge.getSignificantGenesFromDESeq2(0.0005, 'wt', 'mut1')).toHaveLength(0)
    expect(dge.getSignificantGenesFromDESeq2(0.01, 'wt', 'mut1')).toHaveLength(2)
    expect(dge.getSignificantGenesFromDESeq2(0.05, 'wt', 'mut1', true)).toHaveLength(2)
    expect(dge.getSignificantGenesFromDESeq2(0.5, 'wt', 'mut1', true)).toHaveLength(4)
    expect(dge.getSignificantGenesFromDESeq2(0.0005, 'wt', 'mut1', true)).toHaveLength(0)
    expect(dge.getSignificantGenesFromDESeq2(0.02, 'wt', 'mut1', true)).toHaveLength(2)
    expect(dge.getSignificantGenesFromDESeq2(0.5, 'wt', 'mut2')).toHaveLength(3)
    expect(dge.getSignificantGenesFromDESeq2(0.01, 'wt', 'mut2')).toHaveLength(1)
  })
})

describe('Tests with Gene objects', () => {
  test('add DESeq2 analysis to gene', () => {
    let gene = new Gene('gene_1')
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    expect(gene.hasOwnProperty('_deseq2')).toBe(true)
    expect(gene.getDESeq2Analyses()).toHaveLength(1)
    gene.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)
    expect(gene.getDESeq2Analyses()).toHaveLength(2)
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
    expect(gene1.hasOwnProperty('_deseq2')).toBe(true)
    expect(gene1.getDESeq2Analyses()).toHaveLength(4)
    expect(gene1.name).toBe('gene_1')
  })

  test('merge Genes with identical analyses', () => {
    let gene1 = new Gene('gene_1')
    gene1.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    gene1.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)
    let gene2 = new Gene('gene_2')
    gene2.addDESEQ2Analysis(new ConditionPair('wt', 'mut1'), 100, 2, 0.1, 0.2, 0.001, 0.002)
    gene2.addDESEQ2Analysis(new ConditionPair('wt', 'mut2'), 100, 2, 0.1, 0.2, 0.1, 0.2)

    expect(() => {gene1.mergeGenes(gene2)}).toThrow()
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
