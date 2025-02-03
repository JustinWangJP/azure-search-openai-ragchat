import { memo } from "react";

interface SearchProps {
    onChange: (value: string) => void;
}

function Search({ onChange }: SearchProps): JSX.Element {
    return <input type="text" placeholder="Input Search Keyword" onChange={e => onChange(e.target.value)} />;
}

export default memo(Search);
