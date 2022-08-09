import React, { useContext, useEffect, useState, useMemo } from "react";
import { KitContext, TableProps } from "../atoms/kit-context";
import CustomizeColumn from "../atoms/themes/CloudTower/components/Table/CustomizeColumn";
import {
  useCustomizeColumn,
  type CustomizeColumnType,
} from "../atoms/themes/CloudTower/components/Table/customize-column";
import { KubeApi, UnstructuredList } from "../k8s-api-client/kube-api";

type KubectlGetTableProps = {
  basePath: string;
  resource: string;
  namespace: string;
  apiBase: string;
  fieldSelector: string;
  onResponse?: (res: any) => void;
} & Omit<TableProps, "data" | "rowKey">;

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
      onResponse,
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

    let columns: TableProps["columns"] = [];

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
      <kit.Table
        {...tableProps}
        columns={columns}
        ref={ref}
        data={data.items}
        error={error}
        loading={loading}
        rowKey={(row: UnstructuredList["items"][0]) =>
          `${row.metadata.namespace}/${row.metadata.name}`
        }
      />
    );
  }
);

export default KubectlGetTable;
