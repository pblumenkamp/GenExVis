import sys
import random

for i in range(int(sys.argv[1])):
    print("gene_{}\t{}\t{}\t{}\t{}\t{}\t{}".format(i, random.expovariate(1/300), random.gauss(0, 1.5), random.random()/1.5, random.gauss(0, 2), random.expovariate(1/0.01), random.expovariate(1/0.02)))

