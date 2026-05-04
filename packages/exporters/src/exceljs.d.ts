declare module 'exceljs' {
    namespace ExcelJS {
        interface FillPattern {
            type?: string;
            pattern?: string;
            fgColor?: { argb?: string };
        }

        interface Font {
            bold?: boolean;
            italic?: boolean;
            color?: { argb?: string };
        }

        interface Alignment {
            vertical?: string;
            horizontal?: string;
        }

        interface Cell {
            numFmt?: string;
            value?: unknown;
        }

        interface Row {
            font?: Font;
            fill?: FillPattern;
            alignment?: Alignment;
            getCell(indexOrRef: number | string): Cell;
        }

        interface Column {
            width?: number;
        }

        interface Worksheet {
            name: string;
            addRows(rows: unknown[][]): void;
            addRow(row: unknown[]): Row;
            getRow(index: number): Row;
            getCell(ref: string): Cell;
            getColumn(index: number): Column;
        }

        interface Workbook {
            creator?: string;
            lastModifiedBy?: string;
            created?: Date;
            modified?: Date;
            worksheets: Worksheet[];
            addWorksheet(name: string): Worksheet;
            xlsx: {
                writeBuffer(): Promise<ArrayBuffer | Uint8Array>;
                load(source: Uint8Array): Promise<Workbook>;
            };
        }

        const Workbook: {
            new(): Workbook;
        };
    }

    export = ExcelJS;
}
