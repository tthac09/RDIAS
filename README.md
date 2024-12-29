# RDIAS: Radiation Defects Detection Intelligent Identification and Analysis Software 

[[GitHub]](https://github.com/tthac09/RDIAS)

## Overview

This is a software designed for intelligent identifying and analysing metal defects by radiation, as a part of Software Engineering Course. Despite the many imperfections (bugs, safety cautions and etc.) of this software (actually it's just a TOY), we have made it open source to help those beginners.

The software is designed under Browser/Client Architecture, using TCP/IP for passing information.

## Members

[Thomas Chen](https://github.com/tthac09/)

[Anna1ximi](https://github.com/Anna1ximi)

[H.K. Zheng](https://github.com/dt-3t)

## Quick Start

### Requirements

Prepare a conda environment using command `conda create --name <env> --file requirements.txt`.

Install node_modules using command `npm install`.

### Configure DataBase

Set the url, port, username and password for a SQL database in `backend/app.py`.

Tables will be created automatically later by the back-end programmes.

### Start Front-End

Run the following command to start the front-end:

```bash
npm start
```

### Start Back-End

Run the following command to start the back-end:

```bash
conda activate <env>
python backend/app.py
```

## Project Structure
```
                              ### front-end
├── src/                      # Source code
│   ├── components/           # Reusable UI components
│   ├── context/              # Context Auth related files
│   ├── pages/                # Page components
│   ├── services/             # API services and business logic
│   ├── styles/               # CSS or styled-components
│   └── routes/               # Application routing
├── public/                   # Public assets and static files
├── node_modules/             # Installed npm dependencies
                              ### backend
├── uploads/                  # Store uploaded files
├── backend/                  # Functional programmes
│   └── app.py                # Main proc in back-end
                              ### Others
├── requirements.txt
├──package.json
├──package-lock.json
├── .gitignore                 
└── README.md                 
```

## License

This is a project for education purpose. It is licensed by AGPL-3.0. 

Ultralytics YOLO11 is used in our project under the license of AGPL-3.0 for students and enthusiasts. An enterprise license is needed for commercial use.

Some other packages used in this project may also include other licenses, anyone who runs our project should pay attention.

## Acknowledgment

We would like to acknowledge the use of the open-source font [Source Han Sans | 思源黑体 | 思源黑體 | 思源黑體 香港 | 源ノ角ゴシック | 본고딕](https://github.com/adobe-fonts/source-han-sans/) in our project. This font is provided by [*Adobe Fonts*](https://github.com/adobe-fonts).

We would like to acknowledge the use of [Ultralytics YOLO11](https://github.com/ultralytics/ultralytics) in our project. This is provided by [*Ultralytics Inc.*](https://www.ultralytics.com/).

We would also like to acknowledge the use of [RT-DETR](https://github.com/lyuwenyu/RT-DETR) in our project. This is proposed by *Yian Zhao et al.* and *Wenyu Lv et al.* from *Baidu Inc.* in two papers [*DETRs Beat YOLOs on Real-time Object Detection*](https://arxiv.org/abs/2304.08069) and [*RT-DETRv2: Improved Baseline with Bag-of-Freebies for Real-Time Detection Transformer*](https://arxiv.org/abs/2407.17140).

## Contact

If you have any questions, please feel free to create an issue.
