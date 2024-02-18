import { Card } from "@/_shared/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_shared/ui/Table";
import { env } from "@/_shared/utils/env";

export function EnvironmentInfo() {
  return (
    <Card>
      <div className="space-y-2">
        <label className="block font-bold" htmlFor="name">
          環境変数
        </label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>変数名</TableHead>
              <TableHead>値</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(env).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
