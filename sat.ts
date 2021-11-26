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

    /**
     * Recursively make assignments to find a satisfying solution
     * @param conjunctions 
     * @param choicesSoFar 
     */
    private static findPartialSolution(conjunctions: Set<string>[], choicesSoFar: Map<string, boolean>): Map<string, boolean> | null {
        //console.log("....", conjunctions, choicesSoFar);
        let normalVarName = "";
        let negVarName = "";
        for (const varName of conjunctions[0]) {
			normalVarName = varName.indexOf("-") === 0 ? varName.substring(1) : varName;
			if (!choicesSoFar.has(normalVarName)) {
				negVarName = "-" + normalVarName;
				break;
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
        //check the one with the least amount of remaining rows first
        const trueFalse = [trueReduce, falseReduce];
        const trueFalseVal = [true, false];
        if (falseReduce.length < trueReduce.length) {
            trueFalse[0] = falseReduce;
            trueFalse[1] = trueReduce;
            trueFalseVal[0] = false;
            trueFalseVal[1] = true;
        }

        choicesSoFar.set(normalVarName, trueFalseVal[0]);
        const trueNested = this.findPartialSolution(trueFalse[0], choicesSoFar);
        if (trueNested) {
            return trueNested;
        }

        choicesSoFar.set(normalVarName, trueFalseVal[1]);
        const falseNested = this.findPartialSolution(trueFalse[1], choicesSoFar);
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
            if (!conj.has(varName)) {
                trueReduce.push(conj);
            }

            //handle falsey
            if (!conj.has(negVarName)) {
                falseReduce.push(conj);
            }
        }

        return {
            trueReduce, 
            falseReduce
        };
    }
}