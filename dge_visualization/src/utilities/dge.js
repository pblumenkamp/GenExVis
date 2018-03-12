/**
 *
 */
export class DGE {
  /**
   * @constructor
   */
  constructor () {
    /**
     *
     * @type {Set<string>}
     * @private
     */
    this._geneNames = new Set() // List of Gene instances
    /**
     * @type {Array<ConditionPair>}
     * @private
     */
    this._conditionPairs = []
    /**
     *
     * @type {object} Contains Gene instances with gene name as property
     * @private
     */
    this._data = {}
  }

  /**
   * @return {Set<string>}
   */
  get geneNames () {
    return this._geneNames
  }

  /**
   * @return {Array<ConditionPair>}
   */
  get conditionPairs () {
    return this._conditionPairs
  }

  get length () {
    return this.geneNames.size
  }

  get size () {
    return this.length
  }

  getGene(geneName) {
    return this._data[geneName]
  }

  /**
   * Register condition pairs for fast access on all existing conditions. Also reuse existing condition pairs to save memory
   *
   * @param {ConditionPair} conditionPair
   * @return {ConditionPair} If conditionPair is already registered, return registered object, else return conditionPair parameter
   * @private
   */
  _registerConditionPair (conditionPair) {
    for (let pair of this.conditionPairs) {
      if (conditionPair.isEqual(pair)) {
        return pair
      }
    }
    this._conditionPairs.push(conditionPair)
    return conditionPair
  }

  /**
   * @param {Gene} gene
   * @private
   */
  _addGene (gene) {
    this.geneNames.add(gene.name)
    this._data[gene.name] = gene
  }

  /**
   *
   * @param {string} geneName
   * @param {string} condition1
   * @param {string} condition2
   * @param {number} baseMean
   * @param {number} log2FoldChange
   * @param {number} lfcSE
   * @param {number} stat
   * @param {number} pValue
   * @param {number} pAdj
   * @return {DGE}
   */
  addDESeq2Data (geneName, condition1, condition2, baseMean, log2FoldChange, lfcSE, stat, pValue, pAdj) {
    let condPair = this._registerConditionPair(new ConditionPair(condition1, condition2))

    if (this.geneNames.has(geneName)) {
      this.getGene(geneName).addDESEQ2Analysis(condPair, baseMean, log2FoldChange, lfcSE, stat, pValue, pAdj)
      return this
    }

    let gene = new Gene(geneName)
    gene.addDESEQ2Analysis(condPair, baseMean, log2FoldChange, lfcSE, stat, pValue, pAdj)
    this._addGene(gene)
    return this
  }

  /**
   *
   * @param {DGE} other
   */
  mergeDGEs (other) {
    // merge conditionPair lists
    for (let otherPair of other.conditionPairs) {
      let found = false
      for (let thisPair of this.conditionPairs) {
        if (thisPair.isEqual(otherPair)) {
          found = true
          break
        }
      }
      if (!found) {
        this._conditionPairs.push(otherPair)
      }
    }

    for (let geneName of other.geneNames) {
      if (this.geneNames.has(geneName)) {
        this.getGene(geneName).mergeGenes(other.getGene(geneName))
      } else {
        this._addGene(other.getGene(geneName))
      }
    }
  }

  /**
   * Get the names of all genes with a (adjusted) p-value smaller or equal to maxP
   *
   * @param {number} maxP
   * @param {string} condition1
   * @param {string} condition2
   * @param {boolean} [adjustedValues=false]
   * @return {Set<string>} Gene names
   */
  getNamesOfSignificantGenesFromDESeq2 (maxP, condition1, condition2, adjustedValues = false) {
    let genes = new Set()
    let conditions = new ConditionPair(condition1, condition2)

    if (adjustedValues) {
      for (let geneName of this.geneNames) {
        for (let analysis of this.getGene(geneName).deseq2Analyses) {
          if (analysis.hasEqualConditions(conditions)) {
            if (analysis.pAdj <= maxP) {
              genes.add(geneName)
            }
          }
        }
      }
    } else {
      for (let geneName of this.geneNames) {
        for (let analysis of this.getGene(geneName).deseq2Analyses) {
          if (analysis.hasEqualConditions(conditions)) {
            if (analysis.pValue <= maxP) {
              genes.add(geneName)
            }
          }
        }
      }
    }

    return genes
  }

  /**
   *
   * @param {string} condition1
   * @param {string} condition2
   * @return {Set<string>}
   */
  getNamesOfAllGenesFromDESeq2 (condition1, condition2) {
    let genes = new Set()
    let conditions = new ConditionPair(condition1, condition2)

    for (let geneName of this.geneNames) {
      for (let analysis of this.getGene(geneName).deseq2Analyses) {
        if (analysis.hasEqualConditions(conditions)) {
          genes.add(geneName)
        }
      }
    }

    return genes
  }

  /**
   *
   * @param {string} condition1
   * @param {string} condition2
   * @return {DGE}
   */
  getAllGenesFromDESeq2 (condition1, condition2) {
    let dge = new DGE()
    let conditions = new ConditionPair(condition1, condition2)

    for (let geneName of this.geneNames) {
      for (let analysis of this.getGene(geneName).deseq2Analyses) {
        if (analysis.hasEqualConditions(conditions)) {
          dge._addGene(this.getGene(geneName))
          for (let conditionPair of this.getGene(geneName).deseq2ConditionPairs) {
            dge._registerConditionPair(conditionPair)
          }
        }
      }
    }

    return dge
  }
}

/**
 *
 */
export class Gene {
  /**
   * @constructor
   * @param {string} name Gene name
   */
  constructor (name) {
    /**
     *
     * @type {string} gene name
     * @private
     */
    this._name = name
    /**
     * @type {Array<ConditionPair>}
     * @private
     */
    this._deseq2_conditionPairs = []
    /**
     *
     * @type {Array<DESeq2Analysis>}
     * @private
     */
    this._deseq2_analyses = []
  }

  get name () {
    return this._name
  }

  get deseq2ConditionPairs () {
    return this._deseq2_conditionPairs
  }

  get deseq2Analyses () {
    return this._deseq2_analyses
  }

  /**
   * Register condition pairs for fast access on all existing conditions. Also reuse existing condition pairs to save memory
   *
   * @param {ConditionPair} conditionPair
   * @return {ConditionPair} If conditionPair is already registered, return registered object, else return conditionPair parameter
   * @private
   */
  _registerDeseq2ConditionPair (conditionPair) {
    for (let pair of this.deseq2ConditionPairs) {
      if (conditionPair.isEqual(pair)) {
        return pair
      }
    }
    this._deseq2_conditionPairs.push(conditionPair)
    return conditionPair
  }

  /**
   *
   * @param {ConditionPair} conditionPair
   * @param {number} baseMean
   * @param {number} log2FoldChange
   * @param {number} lfcSE
   * @param {number} stat
   * @param {number} pValue
   * @param {number} pAdj
   */
  addDESEQ2Analysis (conditionPair, baseMean, log2FoldChange, lfcSE, stat, pValue, pAdj) {
    this._registerDeseq2ConditionPair(conditionPair)

    for (let thisAnalysis of this._deseq2_analyses) {
      if (thisAnalysis.hasEqualConditions(conditionPair)) {
        throw new AnalysisDuplicateError(conditionPair)
      }
    }

    this._deseq2_analyses.push(new DESeq2Analysis(conditionPair, baseMean, log2FoldChange, lfcSE, stat, pValue, pAdj))
  }

  /**
   * Returns the corresponding DESeg2Analysis to a condition pair
   * @param {ConditionPair} conditionPair
   * @return {DESeq2Analysis|null} Returns a DESeq2Analysis object if conditionPair was found, else null
   */
  getDESEQ2Analysis (conditionPair) {
    for (let thisAnalysis of this._deseq2_analyses) {
      if (thisAnalysis.hasEqualConditions(conditionPair)) {
        return thisAnalysis
      }
    }

    return null
  }

  /**
   *
   * @param {Gene} gene
   * @throws {AnalysisDuplicateError}
   */
  mergeGenes (gene) {
    // merge conditionPair lists
    for (let otherPair of gene.deseq2ConditionPairs) {
      let found = false
      for (let thisPair of this.deseq2ConditionPairs) {
        if (thisPair.isEqual(otherPair)) {
          found = true
          break
        }
      }
      if (!found) {
        this._deseq2_conditionPairs.push(otherPair)
      }
    }

    for (let otherAnalysis of gene._deseq2_analyses) {
      for (let thisAnalysis of this._deseq2_analyses) {
        if (otherAnalysis.hasEqualConditions(thisAnalysis.conditions)) {
          throw new AnalysisDuplicateError(otherAnalysis.conditions)
        }
      }
      this._deseq2_analyses.push(otherAnalysis)
    }
  }
}

/**
 *
 */
export class DESeq2Analysis {
  /**
   * @constructor
   * @param {ConditionPair} conditionPair
   * @param {number} baseMean
   * @param {number} log2FoldChange
   * @param {number} lfcSE
   * @param {number} stat
   * @param {number} pValue
   * @param {number} pAdj
   */
  constructor (conditionPair, baseMean, log2FoldChange, lfcSE, stat, pValue, pAdj) {
    this._conditions = conditionPair
    this._baseMean = baseMean
    this._log2FoldChange = log2FoldChange
    this._lfcSE = lfcSE
    this._stat = stat
    this._pValue = pValue
    this._pAdj = pAdj
  }

  get baseMean () {
    return this._baseMean
  }

  get log2FoldChange () {
    return this._log2FoldChange
  }

  get lfcSE () {
    return this._lfcSE
  }

  get stat () {
    return this._stat
  }

  get pValue () {
    return this._pValue
  }

  get pAdj () {
    return this._pAdj
  }

  get conditions () {
    return this._conditions
  }

  /**
   *
   * @param {ConditionPair} other
   * @returns {boolean}
   */
  hasEqualConditions (conditions) {
    return this.conditions.isEqual(conditions)
  }
}

export class ConditionPair {
  /**
   * @param {string} condition1
   * @param {string} condition2
   */
  constructor (condition1, condition2) {
    this._condition1 = condition1
    this._condition2 = condition2
  }

  /**
   * @return {string}
   */
  get condition1 () {
    return this._condition1
  }

  /**
   * @return {string}
   */
  get condition2 () {
    return this._condition2
  }

  /**
   *
   * @param {ConditionPair} other
   */
  isEqual (other) {
    return (this.condition1 === other.condition1) && (this.condition2 === other.condition2)
  }
}

/**
 *
 */
export class AnalysisDuplicateError extends Error {
  constructor (conditionPair) {
    let message = `Analysis (Cond: ${conditionPair.condition1}, ${conditionPair.condition2}) found more than ones`
    super(message)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

export default {DGE}
