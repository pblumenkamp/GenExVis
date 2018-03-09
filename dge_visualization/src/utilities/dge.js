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
    this._genes = new Set() // List of Gene instances
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
  get genes () {
    return this._genes
  }

  /**
   * @return {Array<ConditionPair>}
   */
  get conditionPairs () {
    return this._conditionPairs
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
    this.genes.add(gene.name)
    this._data[gene.name] = gene
  }

  /**
   *
   * @param {string} geneName
   * @param {string} condition1
   * @param {string} condition2
   * @param {Object} data Analysis-Object (must contain properties baseMean, log2FoldChange, lfcSE, stat, pValue, pAdj)
   * @returns {DGE}
   */
  addDESeq2Data (geneName, condition1, condition2, data) {
    let condPair = this._registerConditionPair(new ConditionPair(condition1, condition2))

    if (this.genes.has(geneName)) {
      this._data[geneName].addDESEQ2Analysis(condPair, data)
      return this
    }

    let gene = new Gene(geneName)
    gene.addDESEQ2Analysis(condPair, data)
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

    for (let geneName of other.genes) {
      if (this.genes.has(geneName)) {
        this._data[geneName].mergeGenes(other._data[geneName])
      } else {
        this._addGene(other._data[geneName])
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
   */
  getSignificantGenesFromDESeq2 (maxP, condition1, condition2, adjustedValues = false) {
    let genes = []
    let conditions = new ConditionPair(condition1, condition2)

    if (adjustedValues) {
      for (let gene of this.genes) {
        for (let analysis of this._data[gene].getDESeq2Analyses()) {
          if (analysis.hasEqualConditions(conditions)) {
            if (analysis.pAdj <= maxP) {
              genes.push(gene)
            }
          }
        }
      }
    } else {
      for (let gene of this.genes) {
        for (let analysis of this._data[gene].getDESeq2Analyses()) {
          if (analysis.hasEqualConditions(conditions)) {
            if (analysis.pValue <= maxP) {
              genes.push(gene)
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
   * @return {Array<string>}
   */
  getAllGenesFromDESeq2 (condition1, condition2) {
    let genes = []
    let conditions = new ConditionPair(condition1, condition2)

    for (let gene of this.genes) {
      for (let analysis of this._data[gene].getDESeq2Analyses()) {
        if (analysis.hasEqualConditions(conditions)) {
          genes.push(gene)
        }
      }
    }

    return genes
  }
}

/**
 *
 */
class Gene {
  /**
   * @constructor
   * @param {string} name Gene name
   */
  constructor (name) {
    this._name = name
  }

  get name () {
    return this._name
  }

  getDESeq2Analyses () {
    return this._deseq2
  }

  /**
   *
   * @param {ConditionPair} conditionPair
   * @param {Object} data Analysis-Object (must contain properties baseMean, log2FoldChange, lfcSE, stat, pValue, pAdj)
   */
  addDESEQ2Analysis (conditionPair, data) {
    if (!this.hasOwnProperty('_deseq2')) {
      this._deseq2 = []
    }
    this._deseq2.push(new DESeq2Data(conditionPair, data.baseMean, data.log2FoldChange, data.lfcSE, data.stat, data.pValue, data.pAdj))
  }

  /**
   *
   * @param {Gene} gene
   * @throws {AnalysisDuplicateError}
   */
  mergeGenes (gene) {
    for (let otherAnalysis of gene._deseq2) {
      for (let thisAnalysis of this._deseq2) {
        if (otherAnalysis.hasEqualConditions(thisAnalysis.conditions)) {
          throw new AnalysisDuplicateError(`Analysis (Cond: ${[...otherAnalysis.conditions]}) found more than ones`)
        }
      }
      this._deseq2.push(otherAnalysis)
    }
  }
}

/**
 *
 */
class DESeq2Data {
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

class ConditionPair {
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
class AnalysisDuplicateError extends Error {
}
