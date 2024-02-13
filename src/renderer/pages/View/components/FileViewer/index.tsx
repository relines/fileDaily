// MyApp.js
import FileViewer from 'react-file-viewer';

const file =
  'atom:///Users/popmart/Documents/产品二部系列2-泡泡玛特20230224-MC20230330143112HE5d.jpg';

const type = 'png';

export default function Index(props: Iprops) {
  return (
    <FileViewer
      fileType={type}
      filePath={file}
      errorComponent={<div>123</div>}
      onError={(e: any) => {
        console.log('error', e);
      }}
    />
  );
}
