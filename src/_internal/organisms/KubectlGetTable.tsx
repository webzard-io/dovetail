import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { KitContext, TableProps } from "../atoms/kit-context";
import { AuxiliaryLine } from "../atoms/themes/CloudTower/components/Table/TableWidgets";
import CustomizeColumn from "../atoms/themes/CloudTower/components/Table/CustomizeColumn";
import {
  useCustomizeColumn,
  type CustomizeColumnType,
} from "../atoms/themes/CloudTower/components/Table/customize-column";
import { KubeApi, UnstructuredList } from "../k8s-api-client/kube-api";
import { styled } from "@linaria/react";

const TableWrapper = styled.div`
  overflow: auto;
  min-height: 150px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const TableContent = styled.div`
  overflow: hidden;
  position: relative;
`;

type Columns = (TableProps['columns'][0] & {
  isActionColumn?: boolean;
  canCustomizable?: boolean;
  isDefaultDisplay?: boolean;
})[];
type KubectlGetTableProps = {
  basePath: string;
  resource: string;
  namespace: string;
  apiBase: string;
  fieldSelector: string;
  defaultSize?: number;
  columns: Columns;
  onResponse?: (res: any) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
} & Omit<TableProps, "data" | "rowKey" | "columns">;

export const emptyData = {
  apiVersion: "",
  kind: "",
  metadata: {},
  items: [],
};

const KubectlGetTable = React.forwardRef<HTMLElement, KubectlGetTableProps>(
  (
    {
      basePath,
      apiBase,
      namespace,
      resource,
      fieldSelector,
      defaultSize,
      onResponse,
      onPageChange,
      onPageSizeChange,
      ...tableProps
    },
    ref
  ) => {
    const kit = useContext(KitContext);
    const [response, setResponse] = useState<{
      data: UnstructuredList;
      loading: boolean;
      error: null | Error;
    }>({
      data: emptyData,
      loading: false,
      error: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [currentSize, setCurrentSize] = useState(defaultSize ?? 10);
    const { data, loading, error } = response;

    const defaultCustomizeColumn: [string, () => CustomizeColumnType[]] =
      useMemo(() => {
        return [
          tableProps.customizableKey || "kgt",
          () => {
            return tableProps.columns.map((column) => ({
              key: column.key,
              width: column.width || 200,
              display: column.isDefaultDisplay ?? true,
            }));
          },
        ];
      }, [tableProps.columns, tableProps.customizableKey]);
    const [customizeColumns] = useCustomizeColumn(...defaultCustomizeColumn);

    let columns: Columns = [];

    customizeColumns.forEach((customizableColumn) => {
      if (!customizableColumn.display) return;

      const column = tableProps.columns.find(
        (column) => column.key === customizableColumn.key
      );

      if (column) {
        columns.push({
          ...column,
          width: customizableColumn.width,
          ellipsis: true,
        });
      }
    });

    const allColumnKeys = tableProps.columns.map(({ key }) => key);
    const disabledColumnKeys: string[] = [];
    const customizableColumnKeys: string[] = [];
    const columnTitleMap = tableProps.columns.reduce((result, column) => {
      result[column.key] = column.title as string;

      return result;
    }, {} as Record<string, string>);

    tableProps.columns.forEach((column) => {
      if (column.canCustomizable) {
        customizableColumnKeys.push(column.key);
      } else {
        disabledColumnKeys.push(column.key);
      }
    });

    columns = columns.map((column) => ({
      ...column,
      title:
        tableProps.customizable && column.isActionColumn ? (
          <CustomizeColumn
            defaultCustomizeColumn={defaultCustomizeColumn}
            allColumnKeys={allColumnKeys}
            disabledColumnKeys={disabledColumnKeys}
            columnTitleMap={columnTitleMap}
            data-test-id={"k8s-customizable-column"}
            customizableColumnKeys={customizableColumnKeys}
          />
        ) : (
          column.title
        ),
    }));

    const onTablePageChange = useCallback(
      (page) => {
        onPageChange?.(page);
        setCurrentPage(page);
      },
      [onPageChange]
    );
    const onTableSizeChange = useCallback(
      (size) => {
        onPageSizeChange?.(size);
        setCurrentSize(size);
      },
      [onPageSizeChange]
    );

    useEffect(() => {
      const api = new KubeApi<UnstructuredList>({
        basePath,
        objectConstructor: {
          kind: "",
          apiBase: `${apiBase}/${resource}`,
          namespace,
        },
      });
      setResponse((prev) => ({ ...prev, loading: true }));
      const stopP = api
        .listWatch({
          query: fieldSelector ? { fieldSelector } : {},
          cb: (res) => {
            setResponse(() => ({ loading: false, error: null, data: res }));
          },
        })
        .catch((err) => {
          setResponse(() => ({ loading: false, error: err, data: emptyData }));
        });

      return () => {
        stopP.then((stop) => stop?.());
      };
    }, [apiBase, resource, namespace]);
    useEffect(() => {
      onResponse?.(response);
    }, [response]);

    return (
      <TableWrapper>
        <TableContent>
          <kit.Table
            {...tableProps}
            columns={columns}
            ref={ref}
            data={data.items.slice(
              (currentPage - 1) * currentSize,
              currentPage * currentSize
            )}
            error={error}
            loading={loading}
            rowKey={(row: UnstructuredList["items"][0]) =>
              `${row.metadata.namespace}/${row.metadata.name}`
            }
          />
          <AuxiliaryLine></AuxiliaryLine>
        </TableContent>
        <kit.Pagination
          current={currentPage}
          size={currentSize}
          count={data.items.length}
          onChange={onTablePageChange}
          onSizeChange={onTableSizeChange}
        />
      </TableWrapper>
    );
  }
);

export default KubectlGetTable;
