import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
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
import { TableLoading } from "../atoms/themes/CloudTower/components/Table/TableWidgets";
import HeaderCell from "../atoms/themes/CloudTower/components/Table/HeaderCell";
import { BLANK_COLUMN } from "../atoms/themes/CloudTower/components/Table/common";

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

type Columns = (TableProps["columns"][0] & {
  isActionColumn?: boolean;
  canCustomizable?: boolean;
  isDefaultDisplay?: boolean;
  className?: string;
})[];
type KubectlGetTableProps = {
  basePath: string;
  watchWsBasePath?: string;
  resource: string;
  namespace: string;
  apiBase: string;
  fieldSelector: string;
  defaultSize?: number;
  columns: Columns;
  response: {
    data: UnstructuredList;
    loading: boolean;
    error: null | Error;
  };
  wrapper: React.MutableRefObject<any>;
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
      watchWsBasePath,
      apiBase,
      namespace,
      resource,
      fieldSelector,
      defaultSize,
      response,
      wrapper,
      onResponse,
      onPageChange,
      onPageSizeChange,
      ...tableProps
    },
    ref
  ) => {
    const kit = useContext(KitContext);
    const auxiliaryLine = useRef(null);
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
    const totalWidth = useMemo(() => {
      return columns.reduce<number>((prev, cur) => {
        return prev + (cur.width || 0);
      }, 0);
    }, [columns]);

    tableProps.columns.forEach((column, index) => {
      customizableColumnKeys.push(column.key);
      if (!column.canCustomizable) {
        disabledColumnKeys.push(column.key);
      }
    });

    if (totalWidth < wrapper.current?.offsetWidth) {
      const last = columns[columns.length - 1];

      if (last.isActionColumn) {
        columns.splice(columns.length - 1, 0, BLANK_COLUMN);
      } else {
        columns.splice(columns.length - 1, 1, {
          ...last,
          className: "no-after",
        });
        columns.push(BLANK_COLUMN);
      }
    }

    columns = columns.map((column, index) => ({
      ...column,
      onHeaderCell: () => ({
        index,
        sortable: column.canCustomizable,
        draggable: column.canCustomizable
      }),
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
        watchWsBasePath,
        objectConstructor: {
          kind: "",
          apiBase: `${apiBase}/${resource}`,
          namespace,
        },
      });
      onResponse?.({ ...response, loading: true });
      const stopP = api
        .listWatch({
          query: fieldSelector ? { fieldSelector, namespace } : { namespace },
          cb: (res) => {
            onResponse?.({ loading: false, error: null, data: res });
          },
        })
        .catch((err) => {
          onResponse?.({ loading: false, error: err, data: emptyData });
        });

      return () => {
        stopP.then((stop) => stop?.());
      };
    }, [apiBase, resource, namespace, basePath, fieldSelector]);

    return response.loading && response.data.items.length === 0 ? (
      <TableLoading></TableLoading>
    ) : (
      <TableWrapper>
        <TableContent>
          <kit.Table
            {...tableProps}
            tableLayout="fixed"
            components={{
              header: {
                cell: (props: any) => (
                  <HeaderCell
                    {...props}
                    resizable={true}
                    components={undefined}
                    auxiliaryLine={auxiliaryLine}
                    wrapper={wrapper}
                    defaultCustomizeColumn={defaultCustomizeColumn}
                  />
                ),
              },
              body: {
                cell: (props: any) => (
                  <td
                    {...props}
                    className={`${props.className} cell_${props.unique}`}
                  />
                ),
              },
            }}
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
            wrapper={wrapper}
          />
          <AuxiliaryLine ref={auxiliaryLine}></AuxiliaryLine>
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
