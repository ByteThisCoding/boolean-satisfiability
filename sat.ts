/**
 * Given a boolean expression in conjunctive normal form, check if a satisfying assignment can be made
 * Input is 2D array:
 * : Inner arrays are considered conjunctions of variables and negated variables
 * : Outer arrays are considered disjunctions of inner arrays
 *
 * Variables will be represented by string names
 * A negation will be represented by "-" in the beginning of the variable name
 */
export class SatSolver {

    //assumes conjunctive normal form
    static findSingleSolution(conjunctions: Set<string>[]): Map<string, boolean> | null {
        return this.findPartialSolution(conjunctions, new Map());
    }

    private static findPartialSolution(conjunctions: Set<string>[], choicesSoFar: Map<string, boolean>): Map<string, boolean> | null {
        //console.log("....", conjunctions, choicesSoFar);
        let normalVarName = "";
        let negVarName = "";
        for (let i=0; !negVarName && i<conjunctions.length; i++) {
            for (const varName of conjunctions[0]) {
                normalVarName = varName.indexOf("-") === 0 ? varName.substring(1) : varName;
                if (!choicesSoFar.has(normalVarName)) {
                    negVarName = "-" + normalVarName;
                    break;
                }
            }
        }

        //if this hasn't been assigned, we know no more valid choices exist
        if (!negVarName) {
            return null;
        }

        //try to remove conjunctions by setting to true
        const { trueReduce, falseReduce } = this.filterReduce(conjunctions, normalVarName, negVarName);

        //if array is empty, we've found our appropriate choices
        if (trueReduce.length === 0) {
            choicesSoFar.set(normalVarName, true);
            return choicesSoFar;
        }
        
        if (falseReduce.length === 0) {
            choicesSoFar.set(normalVarName, false);
            return choicesSoFar;
        }

        //if neither satisfied, try to make nested calls
        choicesSoFar.set(normalVarName, true);
        const trueNested = this.findPartialSolution(trueReduce, choicesSoFar);
        if (trueNested) {
            return trueNested;
        }

        choicesSoFar.set(normalVarName, false);
        const falseNested = this.findPartialSolution(falseReduce, choicesSoFar);
        if (!falseNested) {
            choicesSoFar.delete(normalVarName);
        }
        return falseNested;
    }

    /**
     * Given conjunctions of conjunctions, a variable name, and its negation,
     *      return conjunctions where true conjunctions are removed
     *      and that var + negation are removed from conjunctions
     */
    private static filterReduce(conjunctions: Set<string>[], varName: string, negVarName: string): {
        trueReduce: Set<string>[];
        falseReduce: Set<string>[];
    } {
        const trueReduce: Set<string>[] = [];
        const falseReduce: Set<string>[] = [];

        for (const conj of conjunctions) {
            //handle truthy
            let trueConj = conj;
            if (!trueConj.has(varName)) {
                if (trueConj.has(negVarName)) {
                    trueConj = new Set(conj);
                    trueConj.delete(negVarName);
                }

                trueReduce.push(trueConj);
            }

            //handle falsey
            let falseConj = conj;
            if (!falseConj.has(negVarName)) {
                if (falseConj.has(varName)) {
                    falseConj = new Set(conj);
                    falseConj.delete(varName);
                }

                falseReduce.push(falseConj);
            }
        }

        return {
            trueReduce, 
            falseReduce
        };
    }
}