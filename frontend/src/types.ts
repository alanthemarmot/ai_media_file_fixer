export interface SearchResult {
  id: number;
  title: string;
  releaseDate?: string;
  posterPath?: string;
  mediaType: 'movie' | 'tv';
  name?: string;
}

export interface SearchBarProps {
  onSearch: (results: SearchResult[]) => void;
}

export interface ResultsListProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

export interface DisplayAreaProps {
  selectedItem: SearchResult | null;
}
