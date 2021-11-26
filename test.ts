//we'll test by reading in a file and testing each input against what is expected
//test cases appear in separate folders to indicate satisfiable vs not satisfiable
import fs from "fs";
import { SatSolver } from "./sat";

//run tests
testAll();

/**
 * Test by reading in files, parsing inputs, and running them
 */
function testAll(): void {
    //test unsatisfiable first
    const unsatDir = __dirname + "/test-cases/unsatisfiable";
    const unsat = fs.readdirSync(unsatDir);
    unsat.forEach(unsatFile => {
        const fileName = `${unsatDir}/${unsatFile}`;
        const input = readProblemFile(fileName);
        const startTime = new Date();
        const response = SatSolver.findSingleSolution(input);
        const endTime = new Date();
        if (!response) {
            console.log(`PASSED in ${+endTime - +startTime}ms: ${unsatFile} - unsatisfiable`);
        } else {
            console.log(`FAILED: ${unsatFile} - should be unsatisfiable, got - `, JSON.stringify(Object.fromEntries(response)));
        }
    });

    //test satisfiable
    const satDir = __dirname + "/test-cases/satisfiable";
    const sat = fs.readdirSync(satDir);
    sat.forEach(satFile => {
        const fileName = `${satDir}/${satFile}`;
        const input = readProblemFile(fileName);
        const startTime = new Date();
        const response = SatSolver.findSingleSolution(input);
        const endTime = new Date();
        if (!response) {
            console.log(`FAILED: ${satFile} - should be satisfiable`);
        } else {
            console.log(`PASSED in ${+endTime - +startTime}ms : ${satFile} - assignment found`);
        }
    });
}

/**
 * Read a problem file and convert it to the expected format for the solver
 * This could be more efficient by streaming file, will revisit if required
 */
function readProblemFile(fileName: string): Set<string>[] {
    const contents = fs.readFileSync(fileName, "utf-8");

    const sets: Set<string>[] = [];
    const split = contents.split("\n");
    for (let lineInd = 0; lineInd < split.length; lineInd++) {
        const line = split[lineInd];

        //if % is reached, we've reached the end
        if (line.charAt(0) === "%") {
            break;
        }

        //ignore non-clause lines
        if (line.charAt(0) !== "c" && line.charAt(0) !== "p") {
            const clauses = line.split(" ");
            const strSet = new Set<string>();
            clauses.forEach(clause => {
                const trimmed = clause.trim();
                if (trimmed && trimmed !== "0") {
                    strSet.add(trimmed);
                }
            });

            sets.push(strSet);
        }
    }

    return sets;
}