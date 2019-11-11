library("DESeq2")

d.raw <- read.csv("counts_CDS.txt", header=TRUE, row.names=1, sep='\t', comment.char= '#')
d <- as.matrix(d.raw[, 6:14])
colnames(d) <- c("Untreated_1", "Untreated_2", "Untreated_3", "Erythromycin_1", "Erythromycin_2", "Erythromycin_3", "Clindamycin_1", "Clindamycin_2", "Clindamycin_3")

condition <- as.factor(c("Untreated", "Untreated", "Untreated", "Erythromycin", "Erythromycin", "Erythromycin", "Clindamycin", "Clindamycin", "Clindamycin"))
cData <- data.frame(row.names=colnames(d), condition)

dds <- DESeqDataSetFromMatrix(countData=d, colData=cData, design=~condition)
d.deseq <- DESeq(object=dds)

miriTest2 <- DESeq(dds, betaPrior=FALSE)

# dds <- estimateSizeFactors(dds)
write.csv(counts(dds, normalized=TRUE), file="counts_normalized.txt")

res <- results(d.deseq, contrast=c("condition", "Untreated", "Erythromycin"))
res <- res[complete.cases(res),]
rownames(res[res[,6] < 0.01,])

write.csv(as.data.frame(results(d.deseq, contrast=c("condition", "Untreated", "Erythromycin"))))
# write.csv(as.data.frame(results(d.deseq, contrast=c("condition", "Untreated", "Erythromycin"))), file="MiriTest.txt")
                      
plotMA(res, ylim=c(-10,10))

library(calibrate)
xminVal <- min(res$log2FoldChange[!is.na(res$log2FoldChange)])
xmaxVal <- max(res$log2FoldChange[!is.na(res$log2FoldChange)])
with(res, plot(log2FoldChange, -log10(pvalue), pch=20, main=title,
xlim=c(xminVal-1,xmaxVal+1)))
# Add colored points: red if pvalue<0.01, orange of log2FC>1, green if both)
with(subset(res, pvalue<.01 ), points(log2FoldChange, -log10(pvalue), pch=20,
col="red"))
with(subset(res, abs(log2FoldChange)>1), points(log2FoldChange, -log10(pvalue),
pch=20, col="orange"))
with(subset(res, pvalue<.01 & abs(log2FoldChange)>1), points(log2FoldChange, -
log10(pvalue), pch=20, col="green"))
#Label points with the textxy function from the calibrate plot
res$gene <- rownames(res)
with(subset(res, pvalue<.01 & abs(log2FoldChange)>1), textxy(log2FoldChange, -
log10(pvalue), labs=gene, cex=.7))
