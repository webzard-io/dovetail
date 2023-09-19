import { useUIKit, TableProps as BaseTableProps } from '@cloudtower/eagle';
import { RequiredColumnProps } from '@cloudtower/eagle/dist/spec/base';
import { styled } from '@linaria/react';
import { get } from 'lodash-es';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorContent from '../../internal/components/ErrorContent';
import { useTransformScrollAndColumns } from './common';
import { CustomizeColumnType, useCustomizeColumn } from './customize-column';
import CustomizeColumn from './CustomizeColumn';
import HeaderCell, { HeaderCellProps } from './HeaderCell';
import { TableLoading, AuxiliaryLine } from './TableWidgets';

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

  .ant-pagination {
    display: none;
  }

  .ant-table-container {
    display: flex;
    flex-direction: column;
    
    .ant-table-body {
      flex: 1;
    }
  }
`;

const ACTION_COLUMN_KEY = '_action_';

type IDObject = { id: string; };

export type Column<Data extends IDObject> = RequiredColumnProps<Data> & {
  display: boolean;
};

export type TableProps<Data extends IDObject> = {
  loading: boolean;
  error: boolean;
  dataSource: Data[];
  refetch: () => void;
  rowKey: (string & keyof Data) | ((record: Data) => string);
  activeKey?: unknown;
  selectable?: boolean;
  tableKey: string;
  columns: Array<Column<Data>>;
  scroll?: BaseTableProps<Data>['scroll'];
  currentPage: number;
  currentSize: number;
  onActive?: (key: unknown, record: Data) => void;
  onSelect?: (keys: React.Key[], rows: Data[]) => void;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
}

export type UseActiveRowOptions<Data extends IDObject> = Pick<TableProps<Data>, 'activeKey' | 'rowKey' | 'onActive'>;

export type UseSelectOptions<Data extends IDObject> = Pick<TableProps<Data>, 'selectable' | 'onSelect'>;

type UseComponentsOptions = {
  auxiliaryLineRef: React.RefObject<HTMLDivElement>;
  wrapperRef: React.RefObject<HTMLDivElement>;
  defaultCustomizeColumn: [string, () => CustomizeColumnType[]]
}

type UseColumnsOptions<Data extends IDObject> = Pick<TableProps<Data>, 'loading' | 'tableKey' | 'dataSource' | 'columns' | 'scroll'> & {
  wrapperRef: React.RefObject<HTMLDivElement>;
  defaultCustomizeColumn: [string, () => CustomizeColumnType[]]
}

function useActiveRow<Data extends IDObject>(options: UseActiveRowOptions<Data>) {
  const { activeKey, rowKey, onActive } = options;
  const getRowKeyValue = useCallback((record: Data) => {
    return typeof rowKey === 'string' ? record[rowKey] : rowKey(record);
  }, [rowKey]);
  const rowClassName = useCallback((record: Data) => {
    return getRowKeyValue(record) === activeKey ? 'dovetail-table-active-row' : '';
  }, [activeKey, getRowKeyValue]);
  const onRowClick = useCallback((record: Data, index) => {
    const key = getRowKeyValue(record);

    onActive?.(key, record);
  }, [getRowKeyValue, onActive]);

  return {
    rowClassName,
    onRowClick
  };
}

function useSelect<Data extends IDObject>(options: UseSelectOptions<Data>) {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const { selectable, onSelect } = options;

  const rowSelection = useMemo(() => selectable ? ({
    type: 'checkbox' as const,
    selectedRowKeys: selectedKeys,
    onChange(keys: React.Key[], rows: Data[]) {
      setSelectedKeys(keys);
      onSelect?.(keys, rows);
    },
  }) : undefined, [onSelect, selectedKeys, selectable]);

  return {
    rowSelection,
    selectedKeys,
    setSelectedKeys,
  };
}

function useComponents(options: UseComponentsOptions) {
  const {
    auxiliaryLineRef,
    wrapperRef,
    defaultCustomizeColumn,
  } = options;

  const components = useMemo(
    () => ({
      header: {
        cell: (props: Pick<HeaderCellProps, 'draggable' | 'className' | 'index' | 'sortable'>) => (
          <HeaderCell
            {...props}
            resizable={true}
            components={undefined}
            auxiliaryLine={auxiliaryLineRef}
            wrapper={wrapperRef}
            defaultCustomizeColumn={defaultCustomizeColumn}
          />
        ),
      },
      body: {
        cell: (props: Record<string, unknown>) => (
          <td
            {...props}
            className={`${props.className} cell_${props.unique}`}
          />
        ),
      },
    }),
    [auxiliaryLineRef, defaultCustomizeColumn, wrapperRef]
  );

  return components;
}

function useColumns<Data extends IDObject>(options: UseColumnsOptions<Data>) {
  const kit = useUIKit();
  const {
    defaultCustomizeColumn,
    wrapperRef,
    loading,
    dataSource,
    tableKey,
    columns,
    scroll,
  } = options;
  const [customizeColumns] = useCustomizeColumn(...defaultCustomizeColumn);
  const [, transformedColumns] = useTransformScrollAndColumns<Column<Data>>({
    wrapper: wrapperRef,
    loading,
    rowSelection: false,
    data: dataSource,
    tableKey,
    uniqueKey: tableKey,
    stickyHeader: false,
    columns,
    scroll,
  });
  const {
    columnTitleMap,
    allColumnKeys,
    customizableColumnKeys
  } = useMemo(() => {
    const columnTitleMap: Record<string, string> = {};
    const customizableColumnKeys: string[] = [];
    const allColumnKeys = columns.map((column) => {
      columnTitleMap[column.key] = column.title as string;

      if (column.customizable !== false) {
        customizableColumnKeys.push(column.key);
      }

      return column.key;
    });

    return {
      columnTitleMap,
      allColumnKeys,
      customizableColumnKeys,
    };
  }, [columns]);
  const finalColumns = useMemo(() => transformedColumns.map((column) => ({
    ...column,
    onCell(record: Data) {
      return {
        title: get(record, column.dataIndex),
        unique: column.key,
      };
    },
    title:
      column.key === ACTION_COLUMN_KEY ? (
        <CustomizeColumn
          defaultCustomizeColumn={defaultCustomizeColumn}
          allColumnKeys={allColumnKeys}
          disabledColumnKeys={['name', ACTION_COLUMN_KEY]}
          columnTitleMap={columnTitleMap}
          data-test-id={'k8s-customizable-column'}
          customizableColumnKeys={customizableColumnKeys}
        />
      ) : (
        column.title
      ),
  })), []);

  return finalColumns;
}

function Table<Data extends IDObject>(props: TableProps<Data>) {
  const kit = useUIKit();
  const { t } = useTranslation();
  const {
    loading,
    error,
    dataSource,
    rowKey,
    tableKey,
    columns,
    currentPage,
    currentSize,
    refetch,
    onPageChange,
    onSizeChange,
  } = props;
  const auxiliaryLineRef = useRef(null);
  const wrapperRef = useRef(null);

  const {
    rowSelection
  } = useSelect(props);
  const {
    rowClassName,
    onRowClick,
  } = useActiveRow(props);
  const defaultCustomizeColumn: [string, () => CustomizeColumnType[]] =
    useMemo(() => {
      return [
        tableKey,
        () => {
          return columns.map((column) => ({
            key: column.key,
            width: column.width,
            display: column.display ?? true,
          }));
        },
      ];
    }, [columns, tableKey]);
  const components = useComponents({
    defaultCustomizeColumn,
    auxiliaryLineRef,
    wrapperRef,
  });
  const finalColumns = useColumns({
    ...props,
    wrapperRef,
    defaultCustomizeColumn,
  });

  const pagination = useMemo(() => ({
    current: currentPage,
    pageSize: currentSize,
  }), [currentPage, currentSize]);

  if (loading) {
    return <TableLoading></TableLoading>;
  } else if (error) {
    return (
      <ErrorContent
        errorText={t('dovetail.retry_when_access_data_failed')}
        refetch={refetch}
        style={{ padding: '15px 0' }}
      ></ErrorContent>
    );
  } else if (dataSource.length === 0) {
    return (
      <ErrorContent
        errorText={t('dovetail.empty')}
        style={{ padding: '15px 0' }}
      ></ErrorContent>
    );
  }

  return (
    <TableWrapper className="dovetail-table-wrapper">
      <TableContent>
        <kit.table
          tableLayout="fixed"
          rowClassName={rowClassName}
          components={components}
          columns={finalColumns}
          rowSelection={rowSelection}
          dataSource={dataSource}
          pagination={pagination}
          error={error}
          loading={loading}
          rowKey={rowKey}
          wrapper={wrapperRef}
          onRowClick={onRowClick}
        />
        <AuxiliaryLine ref={auxiliaryLineRef}></AuxiliaryLine>
      </TableContent>
      <kit.pagination
        current={currentPage}
        size={currentSize}
        count={dataSource.length}
        onChange={onPageChange}
        onSizeChange={onSizeChange}
      />
    </TableWrapper>
  );
}

export default Table;
