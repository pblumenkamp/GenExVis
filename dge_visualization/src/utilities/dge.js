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
     * @type {Object<Gene>} Contains Gene instances with gene name as property
     * @private
     */
    this._data = {}
    /**
     *
     * @type {Object<Object<string>>>} Map seqRun to condition {normalization: {<seqRun>: <condition>}}
     * @private
     */
    this._seqRunConditionMapping = {}
    /**
     * @type {Set<string>}
     */
    this._normalizationMethods = new Set()
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

  get seqRuns () {
    return this._seqRunConditionMapping
  }

  /**
   * Returns a set of all normalization methods of imported count data
   * @return {Array<string>}
   */
  get normalizationMethods () {
    return Array.from(this._normalizationMethods)
  }

  /**
   * Get Gene object to gene name
   * @param {string} geneName
   * @return {Gene}
   */
  getGene (geneName) {
    return this._data[geneName]
  }

  /**
   * True if gene is already in dge object
   * @param geneName
   * @return {boolean}
   */
  hasGene (geneName) {
    return this._geneNames.has(geneName)
  }

  /**
   *
   * @param normalization {string} Name of normalization method
   * @param seqRunMapping {Object<string>} Map seqRun to condition {<seqRun>: <condition>}
   */
  setSeqRunMapping (normalization, seqRunMapping) {
    if (!this._seqRunConditionMapping.hasOwnProperty(normalization)) {
      this._seqRunConditionMapping[normalization] = {}
    }
    this._seqRunConditionMapping[normalization] = Object.assign(this._seqRunConditionMapping[normalization], seqRunMapping)
  }

  /**
   * Register condition pairs for fast access on all existing condition pairs. Also reuse existing condition pairs to save memory
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

  _registerNormalizationMethod (normalization) {
    this._normalizationMethods.add(normalization)
  }

  /**
   * @param {Gene} gene
   * @private
   */
  _addGene (gene) {
    this.geneNames.add(gene.name)
    this._data[gene.name] = gene
  }

  addUnnormalizedCountData (geneName, condition, values) {
    this._addCountData(geneName, 'unnormalized', condition, values)
  }

  addDeseq2CountData (geneName, condition, values) {
    this._addCountData(geneName, 'deseq2', condition, values)
  }

  _addCountData (geneName, normalization, condition, values) {
    this._registerNormalizationMethod(normalization)
    let gene
    if (this.hasGene(geneName)) {
      gene = this.getGene(geneName)
    } else {
      gene = new Gene(geneName)
      this._addGene(gene)
    }
    gene.addCountData(normalization, condition, values)
  }

  getUnnormalizedCountDataToGene (geneName, condition) {
    return this._getCountDataToGene(geneName, 'unnormalized', condition)
  }

  getDeseq2CountDataToGene (geneName, condition) {
    return this._getCountDataToGene(geneName, 'deseq2', condition)
  }

  _getCountDataToGene (geneName, normalization, condition) {
    if (this.hasGene(geneName)) {
      return this.getGene(geneName).getCountData(normalization, condition)
    } else {
      return {}
    }
  }

  getAllUnnormalizedCountDataByGene (geneName) {
    return this.getAllCountDataByGene(geneName, 'unnormalized')
  }

  getAllDeseq2CountDataByGene (geneName) {
    return this.getAllCountDataByGene(geneName, 'deseq2')
  }

  getAllCountDataByGene (geneName, normalization) {
    if (this.hasGene(geneName)) {
      return this.getGene(geneName).getAllCountData(normalization)
    } else {
      return {}
    }
  }

  getAllUnnormalizedCountDataByCondition (condition) {
    return this.getCountDataByCondition('unnormalized', condition)
  }

  getAllDeseq2CountDataByCondition (condition) {
    return this.getCountDataByCondition('deseq2', condition)
  }

  getCountDataByCondition (normalization, condition) {
    let countData = {}
    for (let geneName of this.geneNames) {
      let counts = this.getGene(geneName).getCountData(normalization, condition)
      if (Object.keys(counts).length !== 0) {
        countData[geneName] = counts
      }
    }

    return countData
  }

  /**
   *
   * @return {Object<Object<Object<number>>>} {<condition>: {<gene name>: {<sequence run name>: counts}}}
   */
  getAllUnnormalizedCountData () {
    return this.getCountData('unnormalized')
  }

  /**
   *
   * @return {Object<Object<Object<number>>>} {<condition>: {<gene name>: {<sequence run name>: counts}}}
   */
  getAllDeseq2CountData () {
    return this.getCountData('deseq2')
  }

  /**
   *
   * @param normalization {string} name of normalization
   * @return {Object<Object<Object<number>>>} {<condition>: {<gene name>: {<sequence run name>: counts}}}
   */
  getCountData (normalization) {
    let countData = {}
    for (let geneName of this.geneNames) {
      let counts = this.getGene(geneName).getAllCountData(normalization)
      for (let condition of Object.keys(counts)) {
        if (!countData.hasOwnProperty(condition)) {
          countData[condition] = {}
        }
        countData[condition][geneName] = counts[condition]
      }
    }

    return countData
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
        if (analysis.hasEqualConditions(conditions) || analysis.hasEqualConditions(conditions.getOpposite())) {
          genes.add(geneName)
          break
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
        if (analysis.hasEqualConditions(conditions) || analysis.hasEqualConditions(conditions.getOpposite())) {
          dge._addGene(this.getGene(geneName))
          for (let conditionPair of this.getGene(geneName).deseq2ConditionPairs) {
            dge._registerConditionPair(conditionPair)
          }
          break
        }
      }
    }

    return dge
  }

  /**
   *
   * @param genes {Array<string>} list of gene names
   */
  getSubset (genes) {
    let newDGE = new DGE()
    newDGE._seqRunConditionMapping = this._seqRunConditionMapping
    newDGE._normalizationMethods = this._normalizationMethods
    newDGE._geneNames = new Set(genes)
    newDGE._conditionPairs = []
    for (let gene of genes) {
      if (this._data.hasOwnProperty(gene)) {
        newDGE._data[gene] = this._data[gene]

        let newCondPairs = newDGE.getGene(gene).deseq2ConditionPairs
        for (let newPair of newCondPairs) {
          let alreadyAdded = false
          for (let alreadyAddedCondPair of newDGE._conditionPairs) {
            if (newPair.isEqual(alreadyAddedCondPair)) {
              alreadyAdded = true
              break
            }
          }
          if (!alreadyAdded) {
            newDGE._conditionPairs.push(newPair)
          }
        }
      }
    }
    return newDGE
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
     *
     * @type {Object<Object<Object<Array<number>>>>} {normalizationMethod{string}: {condition{string}: {seqRunName: values{Array{number}}}}
     * @private
     */
    this._countData = {}
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

  get normalizationMethods () {
    return Object.keys(this._countData)
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
   * @param {string} normalization
   * @param {string} condition
   * @param {Object<number>} values as {seqRun_name: count}
   */
  addCountData (normalization, condition, values) {
    if (!this._countData.hasOwnProperty(normalization)) {
      this._countData[normalization] = {
        [condition]: values
      }
    } else if (!this._countData[normalization].hasOwnProperty(condition)) {
      this._countData[normalization][condition] = values
    } else {
      this._countData[normalization][condition] = Object.assign(this._countData[normalization][condition], values)
    }
  }

  /**
   *
   * @param {string} normalization
   * @param {string} condition
   * @return {Object<Array<number>>}
   */
  getCountData (normalization, condition) {
    if (this._countData.hasOwnProperty(normalization) && this._countData[normalization].hasOwnProperty(condition)) {
      return this._countData[normalization][condition]
    } else {
      return {}
    }
  }

  /**
   *
   * @param {string} normalization
   * @return {Object<Object<Array<number>>>} {conditionA: [{seqRunName: values}, ...], ...}
   */
  getAllCountData (normalization) {
    if (this._countData.hasOwnProperty(normalization)) {
      return this._countData[normalization]
    } else {
      return {}
    }
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
      } else if (thisAnalysis.hasEqualConditions(conditionPair.getOpposite())) {
        return new DESeq2Analysis(conditionPair.getOpposite(), thisAnalysis.baseMean, -thisAnalysis.log2FoldChange, thisAnalysis.lfcSE, -thisAnalysis.stat, thisAnalysis.pValue, thisAnalysis.pAdj)
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
   * @param conditions {ConditionPair} other
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

  /**
   *
   * @param {ConditionPair} other
   */
  isOpposite (other) {
    return (this.condition1 === other.condition2) && (this.condition2 === other.condition1)
  }

  /**
   *
   * @return {ConditionPair}
   */
  getOpposite () {
    return new ConditionPair(this.condition2, this.condition1)
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
