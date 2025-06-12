"use client"
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const ComparisonTable = ({ confusionMatrixData }: any) => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Metric</TableHead>
                        {confusionMatrixData.models.map((model: any) => (
                            <TableHead key={model}>{model}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>True Positives (TP)</TableCell>
                        {confusionMatrixData.confusionMatrices.map((matrix: any) => (
                            <TableCell key={matrix.TP}>{matrix.TP}</TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        <TableCell>True Negatives (TN)</TableCell>
                        {confusionMatrixData.confusionMatrices.map((matrix: any) => (
                            <TableCell key={matrix.TN}>{matrix.TN}</TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        <TableCell>False Positives (FP)</TableCell>
                        {confusionMatrixData.confusionMatrices.map((matrix: any) => (
                            <TableCell key={matrix.FP}>{matrix.FP}</TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        <TableCell>False Negatives (FN)</TableCell>
                        {confusionMatrixData.confusionMatrices.map((matrix: any) => (
                            <TableCell key={matrix.FN}>{matrix.FN}</TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};

export default ComparisonTable;
