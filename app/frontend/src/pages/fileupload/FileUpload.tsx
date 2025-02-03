import * as React from "react";
import { useContext, useEffect } from "react";
import { UploadFile } from "../../components/UploadFile";
import { LoginContext } from "../../loginContext";
import styles from "./FileUpload.module.css";
import { useLogin, getToken, requireAccessControl } from "../../authConfig";
import { useMsal } from "@azure/msal-react";
import { useRouteLoaderData, useLoaderData, useRevalidator } from "react-router-dom";
import { FluentProvider, TableRowData, webLightTheme } from "@fluentui/react-components";
import { FolderRegular, EditRegular, OpenRegular, DocumentRegular, PeopleRegular, DocumentPdfRegular, VideoRegular } from "@fluentui/react-icons";
import {
    PresenceBadgeStatus,
    Avatar,
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableSelectionCell,
    TableCellLayout,
    useTableFeatures,
    TableColumnDefinition,
    TableRowId,
    useTableSelection,
    createTableColumn
} from "@fluentui/react-components";

import shuffleArray from "../../util/string";
import Search from "../../components/SearchButton/Search";
import { makeStyles, mergeClasses, GriffelStyle } from "@fluentui/react-components";
import useSWR from "swr";

type FileCell = {
    label: string;
    icon: JSX.Element;
};

type LastUpdatedCell = {
    label: string;
    timestamp: number;
};

type LastUpdateCell = {
    label: string;
    icon: JSX.Element;
};

type AuthorCell = {
    label: string;
    status: PresenceBadgeStatus;
};

// type Item = {
//     file: FileCell;
//     author: AuthorCell;
//     lastUpdated: LastUpdatedCell;
//     lastUpdate: LastUpdateCell;
// };

type State = {
    selectedRowsId: Set<TableRowId>;
};

type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
            lat: string;
            lng: string;
        };
    };
};

type Action = {
    type: "selected" | "deselected";
    rowId: TableRowId;
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "selected":
            console.log(action);
            if (state.selectedRowsId.has(action.rowId)) {
                return { ...state };
            }
            state.selectedRowsId.add(action.rowId);
            return { ...state };
        case "deselected":
            console.log(action);
            if (state.selectedRowsId.has(action.rowId)) {
                state.selectedRowsId.delete(action.rowId);
            }

            return { ...state };
        default:
            throw new Error();
    }
}

// const items: Item[] = [
//     {
//         file: { label: "Meeting notes", icon: <DocumentRegular /> },
//         author: { label: "Max Mustermann", status: "available" },
//         lastUpdated: { label: "7h ago", timestamp: 3 },
//         lastUpdate: {
//             label: "You edited this",
//             icon: <EditRegular />
//         }
//     },
//     {
//         file: { label: "Thursday presentation", icon: <FolderRegular /> },
//         author: { label: "Erika Mustermann", status: "busy" },
//         lastUpdated: { label: "Yesterday at 1:45 PM", timestamp: 2 },
//         lastUpdate: {
//             label: "You recently opened this",
//             icon: <OpenRegular />
//         }
//     },
//     {
//         file: { label: "Training recording", icon: <VideoRegular /> },
//         author: { label: "John Doe", status: "away" },
//         lastUpdated: { label: "Yesterday at 1:45 PM", timestamp: 2 },
//         lastUpdate: {
//             label: "You recently opened this",
//             icon: <OpenRegular />
//         }
//     },
//     {
//         file: { label: "Purchase order", icon: <DocumentPdfRegular /> },
//         author: { label: "Jane Doe", status: "offline" },
//         lastUpdated: { label: "Tue at 9:30 AM", timestamp: 1 },
//         lastUpdate: {
//             label: "You shared this in a Teams chat",
//             icon: <PeopleRegular />
//         }
//     }
// ];

const columns: TableColumnDefinition<User>[] = [
    createTableColumn<User>({
        columnId: "username"
    }),
    createTableColumn<User>({
        columnId: "name"
    }),
    createTableColumn<User>({
        columnId: "email"
    }),
    createTableColumn<User>({
        columnId: "address"
    })
];

export function Component(): JSX.Element {
    const { loggedIn } = useContext(LoginContext);
    const client = useLogin ? useMsal().instance : undefined;
    // Practise from here
    const data = useLoaderData() as { users: User[] };
    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
    const prevSelectedRowsRef = React.useRef<Set<TableRowId>>(new Set<TableRowId>());

    const [selectedRows, setSelectedRows] = React.useState(() => new Set<TableRowId>([0, 1]));
    const initialState: State = { selectedRowsId: selectedRows };
    const [selectedRowsState, dispatch] = React.useReducer(reducer, initialState);
    const [tableItems, setTableItems] = React.useState(data.users);
    const handleSearch = React.useCallback(
        (value: string) => {
            const filteredItems = data.users.filter(item => item.username.includes(value));
            console.log(filteredItems);
            setTableItems(filteredItems);
        },
        [tableItems]
    );
    const revalidator = useRevalidator();
    const {
        data: datas,
        error,
        isLoading,
        isValidating
    } = useSWR(
        `users/${selectedRowsState.selectedRowsId.size}`,
        async () => {
            const response = await fetch(`https://jsonplaceholder.typicode.com/users/${selectedRowsState.selectedRowsId.size}`, {});
            const data = await response.json();
            return data;
        },
        {
            //     refreshInterval(latestData) {
            //         console.log("useSWR:" + latestData);
            //         if (selectedRowsState.selectedRowsId.size !== 5) {
            //             return 3000;
            //         }
            //         return 0;
            //     }
            keepPreviousData: true
        }
    );
    // Practise end here

    useEffect(() => {
        console.log(data);
        prevSelectedRowsRef.current = selectedRows;
        console.log(prevSelectedRowsRef.current.values());
        window.addEventListener("resize", () => {
            setWindowWidth(window.innerWidth);
        });
    }, [data, selectedRows]);

    const {
        getRows,
        selection: { allRowsSelected, someRowsSelected, toggleAllRows, toggleRow, isRowSelected }
    } = useTableFeatures<User>(
        {
            columns,
            items: tableItems
        },
        [
            useTableSelection({
                selectionMode: "multiselect",
                selectedItems: selectedRows,
                onSelectionChange: (e, data) => setSelectedRows(data.selectedItems)
            })
        ]
    );

    const rows = getRows(row => {
        const selected = isRowSelected(row.rowId);
        return {
            ...row,
            onClick: (e: React.MouseEvent) => {
                toggleRow(e, row.rowId);
                const rowSelected = isRowSelected(row.rowId);
                dispatch({ type: !rowSelected ? "selected" : "deselected", rowId: row.rowId });
            },
            onKeyDown: (e: React.KeyboardEvent) => {
                console.log(e.key);
                if (e.key === " ") {
                    e.preventDefault();
                    toggleRow(e, row.rowId);
                }
            },
            selected,
            appearance: selected ? ("brand" as const) : ("none" as const)
        };
    });

    const toggleAllKeydown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === " ") {
                toggleAllRows(e);
                e.preventDefault();
            }
        },
        [toggleAllRows]
    );

    return (
        <FluentProvider theme={webLightTheme}>
            <div>
                <h1>
                    Window Width: {windowWidth}px | Selected Rows: {Array.from(selectedRowsState.selectedRowsId).join(", ")}
                </h1>
                <h2>isLoading:{isValidating}</h2>
                <h2></h2>
                <p>I'm still using React Router after like 10 years.</p>
                <button onClick={() => setTableItems(shuffleArray(data.users))}>Shuffle</button>
                <Search onChange={handleSearch}></Search>
                {/* <ul>
                    {tableItems.map(item => (
                        <li key={item.author.status}>{item.author.label}</li>
                    ))}
                </ul> */}
                <div>
                    <Table aria-label="Table with controlled multiselect" style={{ minWidth: "550px" }}>
                        <TableHeader>
                            <TableRow>
                                <TableSelectionCell
                                    checked={allRowsSelected ? true : someRowsSelected ? "mixed" : false}
                                    onClick={toggleAllRows}
                                    onKeyDown={toggleAllKeydown}
                                    checkboxIndicator={{ "aria-label": "Select all rows " }}
                                />

                                <TableHeaderCell>User ID</TableHeaderCell>
                                <TableHeaderCell>Author</TableHeaderCell>
                                <TableHeaderCell>Email</TableHeaderCell>
                                <TableHeaderCell>Address</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map(({ item, selected, onClick, onKeyDown, appearance }) => (
                                <TableRow key={item.id} onClick={onClick} onKeyDown={onKeyDown} aria-selected={selected} appearance={appearance}>
                                    <TableSelectionCell checked={selected} checkboxIndicator={{ "aria-label": "Select row" }} />
                                    <TableCell>
                                        <TableCellLayout>{item.username}</TableCellLayout>
                                    </TableCell>
                                    <TableCell>
                                        <TableCellLayout media={<Avatar aria-label={item.name} name={item.name} />}>{item.name}</TableCellLayout>
                                    </TableCell>
                                    <TableCell>{item.email}</TableCell>
                                    <TableCell>
                                        <TableCellLayout>{item.address.city}</TableCellLayout>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </FluentProvider>
    );
}

Component.displayName = "FileUpload";
