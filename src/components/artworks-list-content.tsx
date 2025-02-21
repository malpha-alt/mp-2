import { useEffect, useState } from "react";
import { Artwork } from "../types";
import { styled } from "styled-components";

const ArtworkPreviewDiv = styled.div`
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    text-align: center;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin: 3rem;
    padding: 1rem;
    width: 40vw;
    background-color: whitesmoke;
    border-radius: 1rem;
    transition: transform 0.3s ease;

    &:hover {
        background-color: lightgray;
        transform: scale(1.05);
    }
`;

const ArtworkImage = styled.img`
    width: 50%;
    max-height: 50%;
    margin-right: 1rem;
    border-radius: 1rem;
    border: 2px solid black;
`;

const TextContainer = styled.div`
    color: #2d2d2d;
    align-self: center;
    align-items: center;
    flex-direction: column;
    justify-content: space-evenly;
    width: 50%;
`;

const ArtworkPreview = ({ artwork }: { artwork: Artwork }) => {
    return (
        <ArtworkPreviewDiv>
            <a href={artwork.objectURL} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}>
                <ArtworkImage
                    src={artwork.primaryImage}
                    alt={`Picture of ${artwork.title}`}
                />
                <TextContainer>
                    <h3>{artwork.title}</h3>
                    <p>{artwork.medium}</p>
                </TextContainer>
            </a>
        </ArtworkPreviewDiv>
    );
};

const LoadingSpinner = styled.div`
    border: 16px solid #f3f3f3;
    border-top: 16px solid #242424;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
    margin-bottom: 2rem;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default function ArtworksListContent() {
    const [displayedArtworks, setDisplayedArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getArtworks() {
            const response = await fetch(
                `https://collectionapi.metmuseum.org/public/collection/v1/objects`
            );
            const data = await response.json();

            let objectIDs = data.objectIDs;
            objectIDs = objectIDs.sort(() => Math.random() - 0.5).slice(0, 25); // randomize and get only 20 IDs

            const artworkPromises = objectIDs.map(async (objectID: number) => {
                const artworkResponse = await fetch(
                    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
                );
                const artwork = await artworkResponse.json();
                if (
                    artwork.primaryImage !== "" &&
                    artwork.medium !== ""
                ) {
                    return artwork;
                }
                return null;
            });

            const artworksData = await Promise.all(artworkPromises);
            const filteredArtworks = artworksData.filter((artwork) => artwork !== null);

            setDisplayedArtworks(filteredArtworks.slice(0, 10)); // display only the first 10 artworks
                                                                // I'm fetching 25 and displaying 10 because some of
                                                               // the artworks are missing the primaryImage or medium

            setLoading(false); // Set loading to false after data is fetched
            console.log("Displayed Artwork IDs:", filteredArtworks.map(artwork => artwork.objectID));
        }
        getArtworks();
    }, []);

    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <div>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div>
                    {displayedArtworks.map((artwork) => (
                        <ArtworkPreview key={artwork.objectID} artwork={artwork} />
                    ))}
                </div>
            )}
            <button onClick={refreshPage}>Refresh</button>
        </div>
    );
}